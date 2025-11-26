import { defineEventHandler, getRouterParam } from 'h3';
import { requireUserId } from '~/server/utils/auth';
import prisma from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const sessionId = getRouterParam(event, 'id');

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID is required',
    });
  }

  // 验证会话属于当前用户
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found',
    });
  }

  // 删除会话
  await prisma.session.delete({
    where: {
      id: sessionId,
    },
  });

  return { success: true };
});
