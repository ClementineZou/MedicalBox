import { defineEventHandler, readBody } from 'h3';
import prisma from '~/server/utils/prisma';
import { getOptionalUser } from '~/server/utils/auth';

interface LoginLogRequest {
  email?: string;
  success: boolean;
  failReason?: string;
  loginMethod: 'email' | 'passkey' | 'oauth';
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginLogRequest>(event);
  const ipAddress = event.node.req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                    event.node.req.socket.remoteAddress || 
                    null;
  const userAgent = event.node.req.headers['user-agent'] || null;

  // 获取用户设备信息
  const deviceInfo = userAgent ? parseUserAgent(userAgent) : null;

  // 获取用户ID
  let userId: string | null = null;
  
  // 1. 如果登录成功，尝试从会话获取（适用于Passkey登录）
  if (body.success) {
    const user = await getOptionalUser(event);
    userId = user?.id || null;
  }
  
  // 2. 如果还没有userId，尝试从email查找
  if (!userId && body.email) {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    userId = user?.id || null;
  }

  // 记录登录历史（即使userId为null也记录失败尝试）
  if (userId) {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        deviceInfo,
        loginMethod: body.loginMethod,
        success: body.success,
        failReason: body.failReason || null,
      },
    });
  }

  return { success: true };
});

// 简单的 User Agent 解析
function parseUserAgent(ua: string): string {
  // 检测操作系统
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // 检测浏览器
  let browser = 'Unknown';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';

  return `${browser} on ${os}`;
}
