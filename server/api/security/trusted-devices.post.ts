import { defineEventHandler, readBody } from 'h3';
import { requireUserId } from '~/server/utils/auth';
import prisma from '~/server/utils/prisma';

interface AddTrustedDeviceRequest {
  deviceId: string;
  deviceName: string;
}

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody<AddTrustedDeviceRequest>(event);

  const ipAddress = event.node.req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                    event.node.req.socket.remoteAddress || 
                    null;
  const userAgent = event.node.req.headers['user-agent'] || 'Unknown';

  // 计算30天后的过期时间
  const trustExpires = new Date();
  trustExpires.setDate(trustExpires.getDate() + 30);

  // 检查设备是否已存在
  const existingDevice = await prisma.trustedDevice.findFirst({
    where: {
      userId,
      deviceId: body.deviceId,
    },
  });

  if (existingDevice) {
    // 更新现有设备
    const updatedDevice = await prisma.trustedDevice.update({
      where: {
        id: existingDevice.id,
      },
      data: {
        lastUsed: new Date(),
        trustExpires,
        isActive: true,
        ipAddress: ipAddress || undefined,
        userAgent,
      },
    });
    return updatedDevice;
  }

  // 创建新的可信设备
  const trustedDevice = await prisma.trustedDevice.create({
    data: {
      userId,
      deviceName: body.deviceName,
      deviceId: body.deviceId,
      ipAddress: ipAddress || undefined,
      userAgent,
      trustExpires,
      isActive: true,
    },
  });

  return trustedDevice;
});
