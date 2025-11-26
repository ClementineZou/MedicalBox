import { defineEventHandler } from 'h3';
import { requireUserId } from '~/server/utils/auth';
import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  // 获取所有活跃会话
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(), // 只返回未过期的会话
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return sessions;
});
