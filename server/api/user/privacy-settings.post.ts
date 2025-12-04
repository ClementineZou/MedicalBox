import { requireUserId } from "~/server/utils/auth";
import prisma from "~/server/utils/prisma";

interface UpdatePrivacySettingsBody {
  enhancedPrivacyEnabled?: boolean;
  privacyVerifyDuration?: number;
}

const VALID_DURATIONS = [5, 10, 15, 30, 60, 120, 240, 480];

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event);
  const body = await readBody<UpdatePrivacySettingsBody>(event);

  try {
    // 如果要启用强化隐私保护，检查用户是否设置了两步验证
    if (body.enhancedPrivacyEnabled === true) {
      const user = await (prisma as any).user.findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true },
      });

      const twoFactor = await prisma.twoFactor.findUnique({
        where: { userId },
      });

      const passkeyCount = await prisma.passkey.count({
        where: { userId },
      });

      // 检查是否至少有一种两步验证方式
      const hasTwoFactorMethod = (user?.twoFactorEnabled && !!twoFactor) || passkeyCount > 0;

      if (!hasTwoFactorMethod) {
        throw createError({
          statusCode: 400,
          statusMessage: "请先设置两步验证（TOTP 或 Passkey）后再启用强化隐私保护",
        });
      }
    }

    // 验证免验证时长
    if (body.privacyVerifyDuration !== undefined) {
      if (!VALID_DURATIONS.includes(body.privacyVerifyDuration)) {
        throw createError({
          statusCode: 400,
          statusMessage: "无效的免验证时长",
        });
      }
    }

    // 更新用户隐私设置
    const updateData: any = {};
    if (body.enhancedPrivacyEnabled !== undefined) {
      updateData.enhancedPrivacyEnabled = body.enhancedPrivacyEnabled;
    }
    if (body.privacyVerifyDuration !== undefined) {
      updateData.privacyVerifyDuration = body.privacyVerifyDuration;
    }

    const updatedUser = await (prisma as any).user.update({
      where: { id: userId },
      data: updateData,
      select: {
        enhancedPrivacyEnabled: true,
        privacyVerifyDuration: true,
      },
    });

    return {
      success: true,
      data: updatedUser,
      message: "隐私设置已更新",
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error updating privacy settings:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "更新隐私设置失败",
    });
  }
});
