import { requireUserId } from "~/server/utils/auth";
import { auth } from "~/lib/auth";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  try {
    // 获取用户隐私设置
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        enhancedPrivacyEnabled: true,
        privacyVerifyDuration: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "用户不存在",
      });
    }

    // 如果未启用强化隐私保护，直接返回已验证
    if (!user.enhancedPrivacyEnabled) {
      return {
        success: true,
        data: {
          requiresVerification: false,
          isVerified: true,
          enhancedPrivacyEnabled: false,
        },
      };
    }

    // 获取当前会话ID
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    const sessionId = session?.session?.id || null;

    // 查找有效的验证记录
    const verification = await (prisma as any).privacyVerification.findFirst({
      where: {
        userId,
        OR: [
          { sessionId },
          { sessionId: null },
        ],
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        expiresAt: 'desc',
      },
    });

    if (verification) {
      const remainingMs = verification.expiresAt.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      return {
        success: true,
        data: {
          requiresVerification: true,
          isVerified: true,
          expiresAt: verification.expiresAt.toISOString(),
          remainingMinutes,
          enhancedPrivacyEnabled: true,
        },
      };
    }

    return {
      success: true,
      data: {
        requiresVerification: true,
        isVerified: false,
        enhancedPrivacyEnabled: true,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error getting privacy status:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "获取隐私验证状态失败",
    });
  }
});
