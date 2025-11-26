import { defineEventHandler, getRouterParam } from 'h3';
import { requireUserId } from '~/server/utils/auth';
import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const deviceId = getRouterParam(event, 'id');

  if (!deviceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Device ID is required',
    });
  }

  // 验证设备属于当前用户
  const device = await prisma.trustedDevice.findFirst({
    where: {
      id: deviceId,
      userId,
    },
  });

  if (!device) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Device not found',
    });
  }

  // 删除可信设备
  await prisma.trustedDevice.delete({
    where: {
      id: deviceId,
    },
  });

  return { success: true };
});
