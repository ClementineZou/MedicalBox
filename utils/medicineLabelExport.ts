import type { Medicine } from '~/types'

/**
 * 导出药品标签为PDF
 * 设计现代简约的标签，每页A4纸可打印多个标签
 * 标签尺寸: 90mm x 50mm (适合常见药盒)
 */
export const exportMedicineLabels = async (medicines: Medicine[]) => {
  // A4纸尺寸：210mm x 297mm
  // 标签尺寸：90mm x 50mm，间距5mm
  // 每行可放2个标签 (90*2 + 5*3 = 195mm)
  // 每列可放5个标签 (50*5 + 5*6 = 280mm)
  // 每页最多10个标签
  
  const labelsPerRow = 2
  const labelsPerColumn = 5
  const labelsPerPage = labelsPerRow * labelsPerColumn
  
  // 构建打印样式
  const styles = `
    <style>
      @page {
        size: A4;
        margin: 10mm;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        background: #fff;
        padding: 0;
      }
      
      .page {
        width: 210mm;
        min-height: 297mm;
        page-break-after: always;
        display: flex;
        flex-wrap: wrap;
        gap: 5mm;
        padding: 0;
        align-items: flex-start;
        align-content: flex-start;
      }
      
      .page:last-child {
        page-break-after: auto;
      }
      
      .label {
        width: 90mm;
        min-height: 50mm;
        border: 2px solid #2563eb;
        border-radius: 4px;
        padding: 4mm;
        display: flex;
        flex-direction: column;
        position: relative;
        background: #fff;
        overflow: visible;
        page-break-inside: avoid;
      }
      
      .label-header {
        margin-bottom: 2mm;
      }
      
      .medicine-name {
        font-size: 16pt;
        font-weight: bold;
        color: #1e40af;
        margin-bottom: 1mm;
        line-height: 1.2;
        max-height: 10mm;
        overflow: hidden;
      }
      
      .medicine-brand {
        font-size: 9pt;
        color: #666;
        margin-bottom: 1mm;
      }
      
      .label-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1mm;
        min-height: 0;
      }
      
      .info-row {
        display: flex;
        align-items: flex-start;
        font-size: 9pt;
        line-height: 1.2;
        margin-bottom: 0;
      }
      
      .info-label {
        color: #666;
        min-width: 18mm;
        font-weight: 500;
        flex-shrink: 0;
      }
      
      .info-value {
        color: #000;
        font-weight: 600;
        flex: 1;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.2;
        max-height: calc(1.2em * 2);
      }
      
      .expiry-warning {
        color: #dc2626;
        font-weight: bold;
      }
      
      .expiry-warning {
        color: #d93025;
        font-weight: bold;
      }
      
      .category-badge {
        display: inline-block;
        background: #dbeafe;
        color: #1e40af;
        padding: 1mm 2mm;
        border-radius: 2mm;
        font-size: 8pt;
        font-weight: 600;
        margin-top: 1.5mm;
        margin-bottom: 1mm;
        border: 1px solid #93c5fd;
      }
      
      .control-type-badge {
        display: inline-block;
        padding: 1mm 2.5mm;
        border-radius: 2mm;
        font-size: 8pt;
        font-weight: 700;
        margin-bottom: 1mm;
      }
      
      .control-type-prescription {
        background: #fed7aa;
        color: #9a3412;
        border: 1.5px solid #fb923c;
      }
      
      .control-type-otc {
        background: #bbf7d0;
        color: #166534;
        border: 1.5px solid #4ade80;
      }
      
      .control-type-psychotropic {
        background: #dc2626;
        color: #fff;
        border: 1.5px solid #991b1b;
      }
      
      .date-field {
        margin-top: auto;
        margin-bottom: 2mm;
        padding-top: 5mm;
        border-top: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        gap: 2mm;
        min-height: 7mm;
        flex-shrink: 0;
      }
      
      .date-label {
        font-size: 10pt;
        color: #000;
        font-weight: 700;
        white-space: nowrap;
      }
      
      .date-input {
        flex: 1;
        border-bottom: 1px solid #999;
        height: 5mm;
      }
      
      .qr-placeholder {
        position: absolute;
        bottom: 4mm;
        right: 4mm;
        width: 12mm;
        height: 12mm;
        border: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 6pt;
        color: #ccc;
        background: white;
        border-radius: 1mm;
      }
      
      @media print {
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  `
  
  // 构建标签HTML
  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>药品标签</title>
        ${styles}
      </head>
      <body>
  `
  
  // 按页分组标签
  const totalPages = Math.ceil(medicines.length / labelsPerPage)
  
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    html += '<div class="page">'
    
    const startIndex = pageIndex * labelsPerPage
    const endIndex = Math.min(startIndex + labelsPerPage, medicines.length)
    
    for (let i = startIndex; i < endIndex; i++) {
      const medicine = medicines[i]
      html += generateLabelHTML(medicine)
    }
    
    html += '</div>'
  }
  
  html += `
      </body>
    </html>
  `
  
  // 打开新窗口并打印
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // 返回Promise，当打印窗口关闭时resolve
    return new Promise<void>((resolve) => {
      // 等待内容加载完成后打印
      printWindow.onload = () => {
        printWindow.print()
      }
      
      // 监听窗口关闭事件
      const checkWindowClosed = setInterval(() => {
        if (printWindow.closed) {
          clearInterval(checkWindowClosed)
          resolve()
        }
      }, 500)
    })
  }
  
  return Promise.resolve()
}

/**
 * 生成单个药品标签的HTML
 */
function generateLabelHTML(medicine: Medicine): string {
  // 判断是否即将过期（30天内）
  const expiryDate = new Date(medicine.expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isExpiring = daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  
  // 格式化有效期
  const expiryDateStr = expiryDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
  
  // 剂量规格信息
  const dosageInfo = medicine.dosage 
    ? `${medicine.dosage}${medicine.dosageUnit || ''}`
    : '-'
  
  // 库存信息
  const quantityInfo = `${medicine.quantity}${medicine.quantityUnit || ''}`
  
  // 用法用量
  const usageInfo = medicine.usage || '-'
  
  // 适应症信息
  const indicationsInfo = medicine.indications || '-'
  
  // 管控类型徽章
  let controlTypeBadge = ''
  if (medicine.controlTypes) {
    let badgeClass = 'control-type-badge'
    if (medicine.controlTypes.includes('精神药品')) {
      badgeClass += ' control-type-psychotropic'
    } else if (medicine.controlTypes.includes('非处方药')) {
      badgeClass += ' control-type-otc'
    } else if (medicine.controlTypes.includes('处方药')) {
      badgeClass += ' control-type-prescription'
    }
    const displayText = medicine.controlTypes.replace(/,/g, '、')
    controlTypeBadge = `<span class="${badgeClass}">${displayText}</span>`
  }
  
  return `
    <div class="label">
      <div class="label-header">
        <div class="medicine-name">${medicine.name}</div>
        ${medicine.brand ? `<div class="medicine-brand">${medicine.brand}</div>` : ''}
        ${medicine.category ? `<span class="category-badge">${medicine.category}</span>` : ''}
        ${controlTypeBadge}
      </div>
      
      <div class="label-body">
        <div class="info-row">
          <span class="info-label">规格:</span>
          <span class="info-value">${dosageInfo}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">适应症:</span>
          <span class="info-value">${indicationsInfo}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">用法用量:</span>
          <span class="info-value">${usageInfo}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">有效期:</span>
          <span class="info-value ${isExpiring ? 'expiry-warning' : ''}">${expiryDateStr}</span>
        </div>
        
        <div class="date-field">
          <span class="date-label">开启日期:</span>
          <div class="date-input"></div>
        </div>
      </div>
    </div>
  `
}

/**
 * 截断过长的文本
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

/**
 * 导出选中药品的标签
 */
export const exportSelectedMedicineLabels = async (
  medicines: Medicine[],
  selectedIds: string[]
) => {
  const selectedMedicines = medicines.filter(m => selectedIds.includes(m.id))
  if (selectedMedicines.length === 0) {
    throw new Error('请至少选择一个药品')
  }
  await exportMedicineLabels(selectedMedicines)
}
