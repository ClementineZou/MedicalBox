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
  
  // 构建打印样式 - 简洁美观紧凑版
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
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page {
        width: 210mm;
        min-height: 297mm;
        page-break-after: always;
        display: flex;
        flex-wrap: wrap;
        gap: 5mm;
        padding-top: 5mm;
        align-items: flex-start;
        align-content: flex-start;
        justify-content: center;
      }
      
      .page:last-child {
        page-break-after: auto;
      }
      
      .label {
        width: 90mm;
        height: 50mm;
        border: 1.5px solid #111;
        border-radius: 6px;
        padding: 3mm 4mm;
        display: flex;
        flex-direction: column;
        background: #fff;
        position: relative;
        overflow: hidden;
        page-break-inside: avoid;
        box-shadow: none;
      }
      
      /* 头部区域 */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #000;
        padding-bottom: 1.5mm;
        margin-bottom: 1.5mm;
        min-height: 10mm;
      }
      
      .header-content {
        flex: 1;
        overflow: hidden;
        padding-right: 2mm;
      }
      
      .medicine-name {
        font-size: 14pt;
        font-weight: 900;
        color: #000;
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .medicine-brand {
        font-size: 8pt;
        color: #444;
        font-weight: 500;
        margin-top: 0.5mm;
      }

      .header-icon {
        width: 6mm;
        height: 6mm;
        flex-shrink: 0;
        opacity: 0.8;
      }

      .header-icon svg {
        width: 100%;
        height: 100%;
      }

      /* 主体内容区域 */
      .content-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1.25mm;
      }
      
      .row {
        display: flex;
        align-items: baseline;
        gap: 2mm;
        line-height: 1.2;
        font-size: 8.5pt;
      }

      .row.badges-row {
        margin-bottom: 0.5mm;
      }

      .field {
        display: flex;
        gap: 1mm;
        align-items: baseline;
        overflow: hidden;
      }
      
      .field.flex-1 { flex: 1; }
      .field.half { width: 48%; }
      
      .label-text {
        font-size: 8pt;
        font-weight: 700;
        color: #222;
        white-space: nowrap;
        flex-shrink: 0;
      }
      
      .value-text {
        color: #000;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .value-text.warning {
        font-weight: 700;
        text-decoration: underline;
      }

      /* 徽章样式 */
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0 1.5mm;
        height: 4mm;
        border-radius: 3px;
        font-size: 7pt;
        font-weight: 700;
        border: 1px solid #000;
        line-height: 1;
        white-space: nowrap;
      }
      
      .badge.filled {
        background: #000;
        color: #fff;
      }

      /* 底部区域 */
      .footer {
        margin-top: auto;
        padding-top: 1.5mm;
        border-top: 1px dashed #bbb;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 10mm;
      }

      .footer-left {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .open-date-label {
        font-size: 7pt;
        font-weight: 700;
        margin-bottom: 1mm;
      }

      .open-date-input {
        width: 25mm;
        border-bottom: 1px solid #000;
        height: 3mm;
      }

      .barcode-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .barcode-svg {
        height: 6mm;
        width: auto;
        max-width: 50mm;
      }

      .barcode-text {
        font-size: 6pt;
        font-family: Consolas, Monaco, monospace;
        font-weight: 600;
        margin-top: 0.5mm;
        letter-spacing: 0.5px;
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
    let badgeClass = 'badge'
    if (medicine.controlTypes.includes('精神药品')) {
      badgeClass += ' filled'
    }
    // 统一为方形，不再区分 rounded
    const displayText = medicine.controlTypes.replace(/,/g, ' ')
    controlTypeBadge = `<span class="${badgeClass}">${displayText}</span>`
  }
  
  // 分类徽章
  const categoryBadge = medicine.category 
    ? `<span class="badge">${medicine.category}</span>` 
    : ''

  return `
    <div class="label">
      <div class="header">
        <div class="header-content">
          <div class="medicine-name">${medicine.name}</div>
          ${medicine.brand ? `<div class="medicine-brand">${medicine.brand}</div>` : ''}
        </div>
        <div class="header-icon">
          ${ICON_SVG}
        </div>
      </div>
      
      <div class="content-body">
        ${(categoryBadge || controlTypeBadge) ? `
        <div class="row badges-row">
          ${categoryBadge}
          ${controlTypeBadge}
        </div>
        ` : ''}
        
        <div class="row">
          <div class="field flex-1">
            <span class="label-text">规格:</span>
            <span class="value-text">${dosageInfo}</span>
          </div>
          <div class="field flex-1">
            <span class="label-text">有效期:</span>
            <span class="value-text ${isExpiring ? 'warning' : ''}">${expiryDateStr}${isExpiring ? '!' : ''}</span>
          </div>
        </div>
        
        <div class="row">
          <div class="field flex-1">
            <span class="label-text">用法:</span>
            <span class="value-text">${translateUsage(usageInfo)}</span>
          </div>
        </div>
        
        <div class="row">
          <div class="field flex-1">
            <span class="label-text">主治:</span>
            <span class="value-text">${truncateText(indicationsInfo, 24)}</span>
          </div>
        </div>

      </div>

      <div class="footer">
        <div class="footer-left">
           <div class="open-date-label">开启日期:</div>
           <div class="open-date-input"></div>
        </div>

        <div class="barcode-container">
          ${barcode?.barcodeSvg ? barcode.barcodeSvg.replace('<svg', '<svg class="barcode-svg"') : ''}
          <div class="barcode-text">${barcode?.barcodeCode || ''}</div>
        </div>
      </div>
    </div>
  `
}

// 辅助函数：可以让用法更紧凑
function translateUsage(usage: string): string {
    return usage.length > 20 ? truncateText(usage, 20) : usage;
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
