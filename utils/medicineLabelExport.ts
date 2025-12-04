import type { Medicine } from '~/types'

// 黑白版项目图标 SVG (base64编码)
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="76.8" fill="white" stroke="black" stroke-width="20"/>
  <g fill="black">
    <rect x="217.6" y="96" width="76.8" height="320" rx="7.68"/>
    <rect x="96" y="217.6" width="320" height="76.8" rx="7.68"/>
  </g>
</svg>`

/**
 * 导出药品标签为PDF
 * 黑白简约设计，适合打印
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
  
  // 构建打印样式 - 全黑白设计
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
        color: #000;
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
        border: 1.5px solid #000;
        border-radius: 2px;
        padding: 4mm;
        display: flex;
        flex-direction: column;
        position: relative;
        background: #fff;
        overflow: visible;
        page-break-inside: avoid;
      }
      
      .label-icon {
        position: absolute;
        top: 3mm;
        right: 3mm;
        width: 8mm;
        height: 8mm;
      }
      
      .label-icon svg {
        width: 100%;
        height: 100%;
      }
      
      .label-header {
        margin-bottom: 2mm;
        padding-right: 10mm;
      }
      
      .medicine-name {
        font-size: 14pt;
        font-weight: 700;
        color: #000;
        margin-bottom: 1mm;
        line-height: 1.2;
        max-height: 10mm;
        overflow: hidden;
        border-bottom: 1.5px solid #000;
        padding-bottom: 1mm;
      }
      
      .medicine-brand {
        font-size: 9pt;
        color: #333;
        margin-bottom: 1mm;
        font-style: italic;
      }
      
      .label-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.8mm;
        min-height: 0;
      }
      
      .badges-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5mm;
        margin-bottom: 1.5mm;
      }
      
      .info-row {
        display: flex;
        align-items: flex-start;
        font-size: 9pt;
        line-height: 1.3;
        margin-bottom: 0;
      }
      
      .info-label {
        color: #000;
        min-width: 18mm;
        font-weight: 600;
        flex-shrink: 0;
      }
      
      .info-value {
        color: #000;
        font-weight: 400;
        flex: 1;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.3;
        max-height: calc(1.3em * 2);
      }
      
      .expiry-warning {
        font-weight: 700;
        text-decoration: underline;
      }
      
      .category-badge {
        display: inline-block;
        background: #fff;
        color: #000;
        padding: 0.8mm 2mm;
        border-radius: 1mm;
        font-size: 7pt;
        font-weight: 600;
        border: 1px solid #000;
      }
      
      .control-type-badge {
        display: inline-block;
        padding: 0.8mm 2mm;
        border-radius: 1mm;
        font-size: 7pt;
        font-weight: 700;
        border: 1px solid #000;
        background: #fff;
        color: #000;
      }
      
      .control-type-prescription {
        background: #fff;
        border-style: dashed;
      }
      
      .control-type-otc {
        background: #fff;
      }
      
      .control-type-psychotropic {
        background: #000;
        color: #fff;
        border: 1.5px solid #000;
      }
      
      .date-field {
        margin-top: auto;
        margin-bottom: 0;
        padding-top: 2mm;
        border-top: 1px solid #000;
        display: flex;
        align-items: center;
        gap: 2mm;
        min-height: 6mm;
        flex-shrink: 0;
      }
      
      .date-label {
        font-size: 9pt;
        color: #000;
        font-weight: 600;
        white-space: nowrap;
      }
      
      .date-input {
        flex: 1;
        border-bottom: 1px solid #000;
        height: 4mm;
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
  
  // 分类徽章
  const categoryBadge = medicine.category 
    ? `<span class="category-badge">${medicine.category}</span>` 
    : ''

  return `
    <div class="label">
      <div class="label-icon">
        ${ICON_SVG}
      </div>
      
      <div class="label-header">
        <div class="medicine-name">${medicine.name}</div>
        ${medicine.brand ? `<div class="medicine-brand">${medicine.brand}</div>` : ''}
      </div>
      
      <div class="label-body">
        ${(categoryBadge || controlTypeBadge) ? `
        <div class="badges-row">
          ${categoryBadge}
          ${controlTypeBadge}
        </div>
        ` : ''}
        
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
          <span class="info-value ${isExpiring ? 'expiry-warning' : ''}">${expiryDateStr}${isExpiring ? ' ⚠' : ''}</span>
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
