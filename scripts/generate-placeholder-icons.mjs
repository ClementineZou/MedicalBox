// PWA 图标占位文件生成脚本
// 注意: 这只是创建占位图标，实际使用时应该使用高质量的 PNG 图标
// 请参考 ICONS_README.md 生成真实的图标文件

import { writeFileSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

// 创建简单的 SVG 占位符
function createPlaceholderSVG(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.15 : 0;
  const innerSize = size - padding * 2;
  const crossWidth = innerSize * 0.15;
  const crossLength = innerSize * 0.625;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#1976d2"/>
  <g fill="white">
    <rect x="${centerX - crossWidth / 2}" y="${centerY - crossLength / 2}" width="${crossWidth}" height="${crossLength}" rx="${crossWidth * 0.1}"/>
    <rect x="${centerX - crossLength / 2}" y="${centerY - crossWidth / 2}" width="${crossLength}" height="${crossWidth}" rx="${crossWidth * 0.1}"/>
  </g>
</svg>`;
}

// 生成标准图标
sizes.forEach(size => {
  const svg = createPlaceholderSVG(size, false);
  const filename = join('public', `icon-${size}x${size}.png.svg`);
  writeFileSync(filename, svg);
  console.log(`Created placeholder: ${filename}`);
});

// 生成可遮罩图标
maskableSizes.forEach(size => {
  const svg = createPlaceholderSVG(size, true);
  const filename = join('public', `icon-maskable-${size}x${size}.png.svg`);
  writeFileSync(filename, svg);
  console.log(`Created placeholder: ${filename}`);
});

console.log('\n⚠️  警告: 这些是 SVG 占位文件，不是真正的 PNG 图标！');
console.log('📖 请参考 public/ICONS_README.md 生成真实的 PNG 图标文件。');
console.log('🔧 推荐使用在线工具: https://www.pwabuilder.com/imageGenerator\n');
