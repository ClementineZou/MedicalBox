import { requireUserId } from "~/server/utils/auth";
import { auth } from "~/lib/auth";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  try {
    // 获取用户设置的免验证时长
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        privacyVerifyDuration: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "用户不存在",
      });
    }

    // 检查用户是否有Passkey
    const passkeyCount = await prisma.passkey.count({
      where: { userId },
    });

    if (passkeyCount === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "未设置Passkey",
      });
    }

    // 获取当前会话ID
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    const sessionId = session?.session?.id || null;

    // 计算过期时间
    const expiresAt = new Date(Date.now() + user.privacyVerifyDuration * 60 * 1000);

    // 创建或更新验证记录
    await (prisma as any).privacyVerification.upsert({
      where: {
        id: `${userId}_${sessionId || 'default'}`,
      },
      create: {
        id: `${userId}_${sessionId || 'default'}`,
        userId,
        verifyType: 'passkey',
        verifiedAt: new Date(),
        expiresAt,
        sessionId,
      },
      update: {
        verifyType: 'passkey',
        verifiedAt: new Date(),
        expiresAt,
      },
    });

    return {
      success: true,
      message: "Passkey 验证成功",
      data: {
        expiresAt: expiresAt.toISOString(),
        remainingMinutes: user.privacyVerifyDuration,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error verifying privacy with passkey:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "验证失败",
    });
  }
});
