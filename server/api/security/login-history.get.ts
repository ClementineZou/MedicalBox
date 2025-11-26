import { defineEventHandler } from 'h3';
import { requireUserId } from '~/server/utils/auth';
import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  // 获取登录历史，最近50条
  const loginHistory = await prisma.loginHistory.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return loginHistory;
});
