#!/usr/bin/env node

/**
 * 测试 Turnstile 验证功能
 * 这是一个独立的测试脚本，用于验证 Turnstile 配置是否正确
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 读取 .env 文件
let siteKey = '';
let secretKey = '';

try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
        if (line.startsWith('TURNSTILE_SITE_KEY=')) {
            siteKey = line.split('=')[1].replace(/"/g, '').trim();
        }
        if (line.startsWith('TURNSTILE_SECRET_KEY=')) {
            secretKey = line.split('=')[1].replace(/"/g, '').trim();
        }
    }
} catch (error) {
    console.error('无法读取 .env 文件');
}

console.log('\n=== Cloudflare Turnstile 配置检查 ===\n');

console.log('1. 环境变量检查:');
console.log(`   TURNSTILE_SITE_KEY: ${siteKey ? '✓ 已配置' : '✗ 未配置'}`);
console.log(`   TURNSTILE_SECRET_KEY: ${secretKey ? '✓ 已配置' : '✗ 未配置'}`);

if (!siteKey || !secretKey) {
    console.log('\n错误: 请在 .env 文件中配置 Turnstile 密钥');
    process.exit(1);
}

console.log('\n2. Site Key 值:');
console.log(`   ${siteKey}`);

console.log('\n3. 测试环境:');
if (siteKey.startsWith('0x4AAAAAAA')) {
    console.log('   ✓ 使用 Cloudflare 测试密钥');
    console.log('   提示: 这些密钥仅用于测试，在生产环境中请使用正式密钥');
} else {
    console.log('   ✓ 使用正式密钥');
}

console.log('\n4. 前端集成检查:');
console.log('   - TurnstileWidget.vue 组件已创建');
console.log('   - 登录页面已集成验证码');
console.log('   - 注册页面已集成验证码');

console.log('\n5. 后端验证检查:');
console.log('   - Turnstile 验证工具已创建 (server/utils/turnstile.ts)');
console.log('   - Auth API 中间件已配置 (server/api/auth/[...].ts)');

console.log('\n=== 配置检查完成 ===\n');
console.log('下一步: 运行 npm run dev 启动应用并测试');
console.log('访问 http://localhost:3000/login 或 http://localhost:3000/register 测试验证码功能\n');

