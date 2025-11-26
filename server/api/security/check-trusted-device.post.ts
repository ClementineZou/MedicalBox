import { defineEventHandler, readBody } from 'h3';
import prisma from '~/server/utils/prisma';

interface CheckTrustedDeviceRequest {
  deviceId: string;
  email: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CheckTrustedDeviceRequest>(event);

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: { id: true },
  });

  if (!user) {
    return { isTrusted: false };
  }

  // 检查是否有有效的可信设备
  const trustedDevice = await prisma.trustedDevice.findFirst({
    where: {
      userId: user.id,
      deviceId: body.deviceId,
      isActive: true,
      trustExpires: {
        gt: new Date(), // 未过期
      },
    },
  });

  return { isTrusted: !!trustedDevice };
});
