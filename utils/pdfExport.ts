import html2canvas from 'html2canvas'
import type { MedicineUsageRecord, VitalSign, Medicine } from '~/types'

/**
 * 创建打印样式
 */
const getPrintStyles = () => `
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
        color: #000;
        background: #fff;
      }
      .page-break {
        page-break-after: always;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
        font-size: 10pt;
      }
      th {
        background-color: #4285f4;
        color: white;
        font-weight: bold;
      }
      .header {
        text-align: center;
        font-size: 18pt;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .info {
        font-size: 10pt;
        margin-bottom: 15px;
        line-height: 1.6;
      }
      .side-effect {
        color: #dc2626;
        font-weight: bold;
      }
      .abnormal {
        color: #dc2626;
        font-weight: bold;
      }
      .expiring {
        color: #dc2626;
        font-weight: bold;
      }
      .chart-image {
        max-width: 100%;
        margin: 20px 0;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #4285f4;
        text-align: center;
        font-size: 9pt;
        color: #666;
      }
      .footer .app-name {
        font-size: 14pt;
        font-weight: bold;
        color: #4285f4;
        margin-bottom: 5px;
      }
      .footer .slogan {
        font-style: italic;
        color: #888;
      }
    }
  </style>
`

/**
 * 获取项目信息footer
 */
const getFooter = () => `
  <div class="footer">
    <div class="app-name">💊 MedicalBox - 智能家庭药箱管理系统</div>
    <div class="slogan">让用药更安全，让健康更可控</div>
  </div>
`

/**
 * 计算总剂量
 */
const calculateTotalDosage = (dosage: string, unitDosage: string, unit: string): string => {
  // 从服用剂量中提取数字（如 "2片" -> 2）
  const match = dosage.match(/(\d+(\.\d+)?)/);
  if (!match) return `${unitDosage}${unit}`;
  
  const quantity = parseFloat(match[1]);
  const unitDosageNum = parseFloat(unitDosage);
  
  if (isNaN(quantity) || isNaN(unitDosageNum)) {
    return `${unitDosage}${unit}`;
  }
  
  const total = quantity * unitDosageNum;
  return `${total}${unit}`;
}

/**
 * 导出用药记录为PDF
 */
export const exportMedicineRecordsToPDF = async (
  records: MedicineUsageRecord[],
  filters: { medicineId?: string; dateFrom?: string; dateTo?: string }
) => {
  // 构建HTML内容
  let html = getPrintStyles()
  
  html += `
    <div class="header">用药记录</div>
    <div class="info">
  `
  
  if (filters.medicineId || filters.dateFrom || filters.dateTo) {
    html += '<strong>筛选条件:</strong><br>'
    
    if (filters.medicineId) {
      const medicine = records[0]?.medicine
      html += `&nbsp;&nbsp;药品: ${medicine?.name || '未知'}<br>`
    }
    
    if (filters.dateFrom || filters.dateTo) {
      html += `&nbsp;&nbsp;日期范围: ${filters.dateFrom || '不限'} 至 ${filters.dateTo || '不限'}<br>`
    }
  } else {
    html += '<strong>导出范围:</strong> 全部记录<br>'
  }
  
  html += `
      <strong>导出时间:</strong> ${new Date().toLocaleString('zh-CN')}<br>
      <strong>共 ${records.length} 条记录</strong>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>药品名称</th>
          <th>剂量</th>
          <th>服用时间</th>
          <th>备注</th>
          <th>副作用</th>
        </tr>
      </thead>
      <tbody>
  `
  
  records.forEach(record => {
    const sideEffect = record.sideEffectNotes || '-'
    const sideEffectClass = record.sideEffectNotes ? ' class="side-effect"' : ''
    
    // 构建剂量显示：服用剂量（计算后的总剂量）
    let dosageDisplay = record.dosage || '-'
    if (record.medicine?.dosage && record.medicine?.dosageUnit && record.dosage) {
      const totalDosage = calculateTotalDosage(record.dosage, record.medicine.dosage, record.medicine.dosageUnit)
      dosageDisplay += ` (${totalDosage})`
    }
    
    html += `
      <tr>
        <td>${record.medicine?.name || '未知药品'}</td>
        <td>${dosageDisplay}</td>
        <td>${new Date(record.usageTime).toLocaleString('zh-CN')}</td>
        <td>${record.notes || '-'}</td>
        <td${sideEffectClass}>${sideEffect}</td>
      </tr>
    `
  })
  
  html += `
      </tbody>
    </table>
    ${getFooter()}
  `
  
  // 打开新窗口并打印
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // 等待内容加载完成后打印
    printWindow.onload = () => {
      printWindow.print()
      // 打印后关闭窗口
      setTimeout(() => {
        printWindow.close()
      }, 100)
    }
  }
}

/**
 * 导出健康监测记录为PDF（包含图表）
 */
export const exportVitalSignsToPDF = async (
  vitalSigns: VitalSign[],
  filters: { type?: string; dateFrom?: string; dateTo?: string },
  chartElement?: HTMLElement | null
) => {
  // 构建HTML内容
  let html = getPrintStyles()
  
  html += `
    <div class="header">健康监测记录</div>
    <div class="info">
  `
  
  if (filters.type || filters.dateFrom || filters.dateTo) {
    html += '<strong>筛选条件:</strong><br>'
    
    if (filters.type) {
      const typeNames: Record<string, string> = {
        height: '身高',
        weight: '体重',
        temperature: '体温',
        bloodPressure: '血压',
        bloodOxygen: '血氧',
        bloodGlucose: '血糖',
        heartRate: '心率'
      }
      html += `&nbsp;&nbsp;体征类型: ${typeNames[filters.type] || filters.type}<br>`
    }
    
    if (filters.dateFrom || filters.dateTo) {
      html += `&nbsp;&nbsp;日期范围: ${filters.dateFrom || '不限'} 至 ${filters.dateTo || '不限'}<br>`
    }
  } else {
    html += '<strong>导出范围:</strong> 全部记录<br>'
  }
  
  html += `
      <strong>导出时间:</strong> ${new Date().toLocaleString('zh-CN')}<br>
      <strong>共 ${vitalSigns.length} 条记录</strong>
    </div>
  `
  
  // 如果有图表，转换为图片
  let chartImageData = ''
  if (chartElement && filters.type) {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      chartImageData = canvas.toDataURL('image/png')
      html += `<img src="${chartImageData}" class="chart-image" />`
    } catch (error) {
      console.error('Error capturing chart:', error)
    }
  }
  
  // 表格数据
  const typeNames: Record<string, string> = {
    height: '身高',
    weight: '体重',
    temperature: '体温',
    bloodPressure: '血压',
    bloodOxygen: '血氧',
    bloodGlucose: '血糖',
    heartRate: '心率'
  }
  
  html += `
    <table>
      <thead>
        <tr>
          <th>体征类型</th>
          <th>数值</th>
          <th>测量时间</th>
          <th>状态</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
  `
  
  vitalSigns.forEach(record => {
    let value = ''
    if (record.type === 'bloodPressure') {
      value = `${record.systolic}/${record.diastolic} ${record.unit}`
    } else {
      value = `${record.value} ${record.unit}`
    }
    
    const status = record.isNormal ? '正常' : '异常'
    const statusClass = record.isNormal ? '' : ' class="abnormal"'
    
    html += `
      <tr>
        <td>${typeNames[record.type] || record.type}</td>
        <td>${value}</td>
        <td>${new Date(record.measureTime).toLocaleString('zh-CN')}</td>
        <td${statusClass}>${status}</td>
        <td>${record.notes || '-'}</td>
      </tr>
    `
  })
  
  html += `
      </tbody>
    </table>
    ${getFooter()}
  `
  
  // 打开新窗口并打印
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // 等待内容加载完成后打印
    printWindow.onload = () => {
      printWindow.print()
      // 打印后关闭窗口
      setTimeout(() => {
        printWindow.close()
      }, 100)
    }
  }
}

/**
 * 导出药品列表为PDF
 */
export const exportMedicinesToPDF = async (
  medicines: Medicine[],
  filters: { searchQuery?: string; category?: string }
) => {
  // 构建HTML内容
  let html = getPrintStyles()
  
  html += `
    <div class="header">药品管理</div>
    <div class="info">
  `
  
  if (filters.searchQuery || filters.category) {
    html += '<strong>筛选条件:</strong><br>'
    
    if (filters.searchQuery) {
      html += `&nbsp;&nbsp;搜索关键词: ${filters.searchQuery}<br>`
    }
    
    if (filters.category) {
      html += `&nbsp;&nbsp;药品分类: ${filters.category}<br>`
    }
  } else {
    html += '<strong>导出范围:</strong> 全部药品<br>'
  }
  
  html += `
      <strong>导出时间:</strong> ${new Date().toLocaleString('zh-CN')}<br>
      <strong>共 ${medicines.length} 种药品</strong>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>药品名称</th>
          <th>品牌</th>
          <th>分类</th>
          <th>剂量规格</th>
          <th>库存</th>
          <th>有效期</th>
          <th>存放位置</th>
        </tr>
      </thead>
      <tbody>
  `
  
  medicines.forEach(medicine => {
    const expiryDate = new Date(medicine.expiryDate)
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const isExpiring = daysUntilExpiry <= 30 && daysUntilExpiry >= 0
    const expiryClass = isExpiring ? ' class="expiring"' : ''
    const expiryText = medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('zh-CN') : '-'
    
    const dosageText = medicine.dosage ? `${medicine.dosage}${medicine.dosageUnit || ''}` : '-'
    const quantityText = medicine.quantity ? `${medicine.quantity}${medicine.quantityUnit || ''}` : '-'
    
    html += `
      <tr>
        <td>${medicine.name || '-'}</td>
        <td>${medicine.brand || '-'}</td>
        <td>${medicine.category || '-'}</td>
        <td>${dosageText}</td>
        <td>${quantityText}</td>
        <td${expiryClass}>${expiryText}</td>
        <td>${medicine.location || '-'}</td>
      </tr>
    `
  })
  
  html += `
      </tbody>
    </table>
    ${getFooter()}
  `
  
  // 打开新窗口并打印
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // 等待内容加载完成后打印
    printWindow.onload = () => {
      printWindow.print()
      // 打印后关闭窗口
      setTimeout(() => {
        printWindow.close()
      }, 100)
    }
  }
}
