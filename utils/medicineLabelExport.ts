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
 * 紧凑简洁的黑白设计，适合打印
 * 标签尺寸: 90mm x 50mm (适合常见药盒)
 * 
 * 设计特点:
 * - 更小的字体和间距，提升信息密度
 * - 精简标签文字（去掉冒号等）
 * - 条形码与启用日期水平排列，节省空间
 * - 更细的边框和分隔线
 */
export const exportMedicineLabels = async (medicines: Medicine[]) => {
  // 仅在客户端需要条形码渲染
  let JsBarcode: any
  if (typeof window !== 'undefined') {
    const mod = await import('jsbarcode')
    JsBarcode = (mod as any).default || mod
  }

  // A4纸尺寸：210mm x 297mm
  // 标签尺寸：90mm x 50mm，间距5mm
  // 每行可放2个标签 (90*2 + 5*3 = 195mm)
  // 每列可放5个标签 (50*5 + 5*6 = 280mm)
  // 每页最多10个标签
  
  const labelsPerRow = 2
  const labelsPerColumn = 5
  const labelsPerPage = labelsPerRow * labelsPerColumn
  
  // 构建打印样式 - 紧凑简洁设计
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
        height: 50mm;
        border: 1.5px solid #000;
        border-radius: 3px;
        padding: 3mm;
        display: flex;
        flex-direction: column;
        position: relative;
        background: #fff;
        overflow: hidden;
        page-break-inside: avoid;
      }
      
      .label-icon {
        position: absolute;
        top: 2.5mm;
        right: 2.5mm;
        width: 6mm;
        height: 6mm;
        opacity: 0.7;
      }
      
      .label-icon svg {
        width: 100%;
        height: 100%;
      }
      
      .label-header {
        margin-bottom: 1.5mm;
        padding-right: 8mm;
        border-bottom: 1.5px solid #000;
        padding-bottom: 1.5mm;
      }
      
      .medicine-name {
        font-size: 13pt;
        font-weight: 700;
        color: #000;
        margin-bottom: 0.5mm;
        line-height: 1.15;
        max-height: 10mm;
        overflow: hidden;
      }
      
      .medicine-brand {
        font-size: 8pt;
        color: #444;
        font-weight: 500;
        line-height: 1.2;
      }
      
      .label-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0;
        min-height: 0;
      }
      
      .badges-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5mm;
        margin-bottom: 1mm;
        align-items: center;
      }
      
      .info-row {
        display: flex;
        align-items: flex-start;
        font-size: 8pt;
        line-height: 1.3;
        padding: 1mm 0;
      }
      
      .info-label {
        color: #000;
        min-width: 14mm;
        font-weight: 600;
        flex-shrink: 0;
      }
      
      .info-value {
        color: #000;
        font-weight: 400;
        flex: 1;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      
      .expiry-warning {
        font-weight: 700;
        text-decoration: underline;
      }
      
      .category-badge, .control-type-badge {
        display: inline-flex;
        align-items: center;
        padding: 0 1.5mm;
        height: 4mm;
        border-radius: 2px;
        font-size: 7pt;
        font-weight: 600;
        border: 1px solid #000;
        line-height: 1;
      }

      .control-type-badge {
        font-weight: 700;
      }
      
      .control-type-prescription {
        background: #fff;
        border-style: solid;
      }
      
      .control-type-otc {
        background: #fff;
        border-radius: 50px;
      }
      
      .control-type-psychotropic {
        background: #000;
        color: #fff;
        border: 1.5px solid #000;
      }

      .label-footer {
        margin-top: auto;
        flex-shrink: 0;
        display: flex;
        gap: 1mm;
        padding-top: 1.5mm;
        border-top: 1px solid #ccc;
        align-items: center;
      }
      
      .barcode-field {
        display: flex;
        align-items: center;
        gap: 1.5mm;
        flex: 1;
      }

      .barcode-svg {
        height: 7mm;
        width: auto;
        max-width: 35mm;
      }

      .barcode-text {
        font-size: 7pt;
        font-family: monospace;
        font-weight: 500;
        color: #000;
      }
      
      .date-field {
        display: flex;
        align-items: center;
        gap: 1mm;
        flex: 1;
      }

      .date-label {
        font-size: 7pt;
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
      const code = medicine.barcode || medicine.id
      const barcodeSvg = JsBarcode ? generateBarcodeSvg(JsBarcode, code) : ''
      html += generateLabelHTML(medicine, { barcodeCode: code, barcodeSvg })
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
function generateLabelHTML(
  medicine: Medicine,
  barcode?: {
    barcodeCode: string
    barcodeSvg: string
  }
): string {
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
          <span class="info-label">规格</span>
          <span class="info-value">${dosageInfo}</span>
        </div>

        <div class="info-row">
          <span class="info-label">适应症</span>
          <span class="info-value">${indicationsInfo}</span>
        </div>

        <div class="info-row">
          <span class="info-label">用法</span>
          <span class="info-value">${usageInfo}</span>
        </div>

        <div class="info-row">
          <span class="info-label">有效期</span>
          <span class="info-value ${isExpiring ? 'expiry-warning' : ''}">${expiryDateStr}${isExpiring ? ' ⚠' : ''}</span>
        </div>
      </div>

      <div class="label-footer">
        <div class="barcode-field">
          ${barcode?.barcodeSvg ? barcode.barcodeSvg.replace('<svg', '<svg class="barcode-svg"') : ''}
          <span class="barcode-text">${barcode?.barcodeCode || ''}</span>
        </div>
        <div class="date-field">
          <span class="date-label">启用</span>
          <div class="date-input"></div>
        </div>
      </div>
    </div>
  `
}

function generateBarcodeSvg(JsBarcode: any, value: string): string {
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('xmlns', svgNS)

  JsBarcode(svg, value, {
    format: 'CODE128',
    displayValue: false,
    lineColor: '#000000',
    background: '#ffffff',
    margin: 0,
    width: 2,
    height: 40
  })

  return new XMLSerializer().serializeToString(svg)
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
