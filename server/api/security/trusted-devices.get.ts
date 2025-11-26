import { defineEventHandler } from 'h3';
import { requireUserId } from '~/server/utils/auth';
import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  // 获取所有可信设备
  const trustedDevices = await prisma.trustedDevice.findMany({
    where: {
      userId,
      isActive: true,
      trustExpires: {
        gt: new Date(), // 只返回未过期的设备
      },
    },
    orderBy: {
      lastUsed: 'desc',
    },
  });

  return trustedDevices;
});
