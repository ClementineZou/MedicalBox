import { requireUserId } from "~/server/utils/auth";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);

  try {
    // 获取用户信息，包括隐私设置
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        enhancedPrivacyEnabled: true,
        privacyVerifyDuration: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // 检查是否有Passkey
    const passkeyCount = await prisma.passkey.count({
      where: { userId },
    });

    // 检查是否有两步验证
    const twoFactor = await prisma.twoFactor.findUnique({
      where: { userId },
    });

    return {
      success: true,
      data: {
        enhancedPrivacyEnabled: user.enhancedPrivacyEnabled,
        privacyVerifyDuration: user.privacyVerifyDuration,
        hasTwoFactor: user.twoFactorEnabled && !!twoFactor,
        hasPasskey: passkeyCount > 0,
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error getting privacy settings:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "获取隐私设置失败",
    });
  }
});
