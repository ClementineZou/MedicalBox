import html2canvas from 'html2canvas'
import type { MedicineUsageRecord, VitalSign, Medicine } from '~/types'

/**
 * 创建打印样式 - 黑白极简设计 (参考药品标签风格)
 */
const getPrintStyles = () => `
  <style>
    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }
      body {
        font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #000;
        background: #fff;
        line-height: 1.4;
      }
      .page-break {
        page-break-after: always;
      }
      
      /* Header Design */
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #000;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }
      .header-title-section {
        display: flex;
        flex-direction: column;
      }
      .header-title {
        font-size: 24pt;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 0;
      }
      .header-subtitle {
        font-size: 10pt;
        font-weight: normal;
        margin-top: 5px;
        color: #333;
      }
      .header-logo {
        width: 40px;
        height: 40px;
      }
      
      /* Info Box */
      .info-box {
        border: 1px solid #000;
        padding: 10px;
        margin-bottom: 20px;
        font-size: 10pt;
        background-color: #fcfcfc;
      }
      .info-row {
        display: flex;
        margin-bottom: 5px;
      }
      .info-row:last-child {
        margin-bottom: 0;
      }
      .info-label {
        font-weight: bold;
        width: 80px;
        flex-shrink: 0;
      }
      
      /* Table Design */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        border: 2px solid #000;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px 10px;
        text-align: left;
        font-size: 10pt;
      }
      th {
        background-color: #f0f0f0;
        color: #000;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 9pt;
      }
      tr:nth-child(even) {
        background-color: #fafafa;
      }
      
      /* Status Indicators - Black & White optimized */
      .status-text {
        font-weight: bold;
      }
      .warning-text {
        font-weight: bold;
        text-decoration: underline;
      }
      
      /* Chart */
      .chart-image {
        max-width: 100%;
        margin: 20px 0;
        border: 1px solid #000;
        filter: grayscale(100%) contrast(120%);
      }
      
      /* Footer */
      .footer {
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid #000;
        text-align: center;
        font-size: 8pt;
        color: #000;
      }
      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  </style>
`

// 黑白版项目图标 SVG (base64编码) 用于头部
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="76.8" fill="white" stroke="black" stroke-width="20"/>
  <g fill="black">
    <rect x="217.6" y="96" width="76.8" height="320" rx="7.68"/>
    <rect x="96" y="217.6" width="320" height="76.8" rx="7.68"/>
  </g>
</svg>`

/**
 * 获取项目信息footer
 */
const getFooter = () => `
  <div class="footer">
    <div class="footer-content">
      <span>MedicalBox 智能家庭药箱管理系统</span>
      <span>第 1 页</span>
    </div>
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
    <div class="header-container">
      <div class="header-title-section">
        <h1 class="header-title">用药记录</h1>
        <span class="header-subtitle">MEDICINE USAGE RECORD</span>
      </div>
      <div class="header-logo">${LOGO_SVG}</div>
    </div>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">导出时间:</span>
        <span>${new Date().toLocaleString('zh-CN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">记录总数:</span>
        <span>${records.length} 条</span>
      </div>
  `
  
  if (filters.medicineId || filters.dateFrom || filters.dateTo) {
    if (filters.medicineId) {
      const medicine = records[0]?.medicine
      html += `
        <div class="info-row">
          <span class="info-label">特定药品:</span>
          <span>${medicine?.name || '未知'}</span>
        </div>`
    }
    
    if (filters.dateFrom || filters.dateTo) {
      html += `
        <div class="info-row">
          <span class="info-label">日期范围:</span>
          <span>${filters.dateFrom || '不限'} 至 ${filters.dateTo || '不限'}</span>
        </div>`
    }
  } else {
    html += `
      <div class="info-row">
        <span class="info-label">导出范围:</span>
        <span>全部记录</span>
      </div>`
  }
  
  html += `
    </div>
    
    <table>
      <thead>
        <tr>
          <th>药品名称</th>
          <th>服用剂量</th>
          <th>服用时间</th>
          <th>副作用/异常</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
  `
  
  records.forEach(record => {
    const sideEffect = record.sideEffectNotes || '-'
    const sideEffectClass = record.sideEffectNotes ? ' class="warning-text"' : ''
    
    // 构建剂量显示
    let dosageDisplay = record.dosage || '-'
    if (record.medicine?.dosage && record.medicine?.dosageUnit && record.dosage) {
      const totalDosage = calculateTotalDosage(record.dosage, record.medicine.dosage, record.medicine.dosageUnit)
      dosageDisplay += ` (${totalDosage})`
    }
    
    html += `
      <tr>
        <td><strong>${record.medicine?.name || '未知药品'}</strong></td>
        <td>${dosageDisplay}</td>
        <td>${new Date(record.usageTime).toLocaleString('zh-CN')}</td>
        <td${sideEffectClass}>${sideEffect}</td>
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
    <div class="header-container">
      <div class="header-title-section">
        <h1 class="header-title">健康监测记录</h1>
        <span class="header-subtitle">VITAL SIGNS MONITORING</span>
      </div>
      <div class="header-logo">${LOGO_SVG}</div>
    </div>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">导出时间:</span>
        <span>${new Date().toLocaleString('zh-CN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">记录总数:</span>
        <span>${vitalSigns.length} 条</span>
      </div>
  `
  
  if (filters.type || filters.dateFrom || filters.dateTo) {
    if (filters.type) {
      const typeNames: Record<string, string> = {
        height: '身高',
        weight: '体重',
        bmi: 'BMI',
        temperature: '体温',
        bloodPressure: '血压',
        bloodOxygen: '血氧',
        bloodGlucose: '血糖',
        heartRate: '心率'
      }
      html += `
        <div class="info-row">
          <span class="info-label">体征类型:</span>
          <span>${typeNames[filters.type] || filters.type}</span>
        </div>`
    }
    
    if (filters.dateFrom || filters.dateTo) {
      html += `
        <div class="info-row">
          <span class="info-label">日期范围:</span>
          <span>${filters.dateFrom || '不限'} 至 ${filters.dateTo || '不限'}</span>
        </div>`
    }
  } else {
    html += `
      <div class="info-row">
        <span class="info-label">导出范围:</span>
        <span>全部记录</span>
      </div>`
  }
  
  html += `</div>`
  
  // 如果有图表，转换为图片
  let chartImageData = ''
  if (chartElement && filters.type) {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      chartImageData = canvas.toDataURL('image/png')
      html += `<div class="chart-container"><img src="${chartImageData}" class="chart-image" /></div>`
    } catch (error) {
      console.error('Error capturing chart:', error)
    }
  }
  
  // 表格数据
  const typeNames: Record<string, string> = {
    height: '身高',
    weight: '体重',
    bmi: 'BMI',
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
          <th>测量数值</th>
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
    const statusClass = record.isNormal ? '' : ' class="warning-text"'
    
    html += `
      <tr>
        <td><strong>${typeNames[record.type] || record.type}</strong></td>
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
    <div class="header-container">
      <div class="header-title-section">
        <h1 class="header-title">药品清单</h1>
        <span class="header-subtitle">MEDICINE INVENTORY LIST</span>
      </div>
      <div class="header-logo">${LOGO_SVG}</div>
    </div>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">导出时间:</span>
        <span>${new Date().toLocaleString('zh-CN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">药品总数:</span>
        <span>${medicines.length} 种</span>
      </div>
  `
  
  if (filters.searchQuery || filters.category) {    
    if (filters.searchQuery) {
      html += `
        <div class="info-row">
          <span class="info-label">搜索关键词:</span>
          <span>${filters.searchQuery}</span>
        </div>`
    }
    
    if (filters.category) {
      html += `
        <div class="info-row">
          <span class="info-label">药品分类:</span>
          <span>${filters.category}</span>
        </div>`
    }
  } else {
    html += `
      <div class="info-row">
        <span class="info-label">导出范围:</span>
        <span>全部药品</span>
      </div>`
  }
  
  html += `
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
    const expiryClass = isExpiring ? ' class="warning-text"' : ''
    const expiryText = medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('zh-CN') : '-'
    
    const dosageText = medicine.dosage ? `${medicine.dosage}${medicine.dosageUnit || ''}` : '-'
    const quantityText = medicine.quantity ? `${medicine.quantity}${medicine.quantityUnit || ''}` : '-'
    
    html += `
      <tr>
        <td><strong>${medicine.name || '-'}</strong></td>
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
