import { requireUserId } from "~/server/utils/auth";
import { auth } from "~/lib/auth";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // 验证用户身份
  const userId = await requireUserId(event);
  
  // 获取当前会话
  const sessionData = await auth.api.getSession({
    headers: event.headers,
  });

  // 获取请求体
  const body = await readBody(event);

  if (!body.type || !body.code) {
    throw createError({
      statusCode: 400,
      message: "缺少验证类型或验证码",
    });
  }

  if (!["totp", "backup_code"].includes(body.type)) {
    throw createError({
      statusCode: 400,
      message: "无效的验证类型",
    });
  }

  // 检查用户是否启用了两步验证
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: "用户不存在",
    });
  }

  if (!user.twoFactorEnabled) {
    throw createError({
      statusCode: 400,
      message: "您尚未启用两步验证",
    });
  }

  let isValid = false;

  try {
    if (body.type === "totp") {
      // 使用 better-auth 的 API 验证 TOTP
      // verifyTOTP 成功时返回 { token, user }，失败时抛出错误
      const result = await auth.api.verifyTOTP({
        headers: event.headers,
        body: { code: body.code },
      });
      // 如果没有抛出错误，说明验证成功
      isValid = !!result;
    } else if (body.type === "backup_code") {
      // 使用 better-auth 的 API 验证备份码
      // 备份码验证后会被自动标记为已使用
      const result = await auth.api.verifyBackupCode({
        headers: event.headers,
        body: { code: body.code },
      });
      // 如果没有抛出错误，说明验证成功
      isValid = !!result;
    }
  } catch (verifyError: any) {
    console.error("验证错误:", verifyError?.message || verifyError);
    isValid = false;
  }

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message:
        body.type === "totp"
          ? "验证码错误，请检查您的身份验证器应用"
          : "备份码无效或已被使用",
    });
  }

  // 验证成功，创建或更新验证记录
  // 从用户设置获取免验证时长
  const userWithSettings = await prisma.user.findUnique({
    where: { id: userId },
  }) as any;
  
  const durationMinutes = userWithSettings?.privacyVerifyDuration ?? 10;
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  // 删除旧记录并创建新记录
  await (prisma as any).privacyVerification.deleteMany({
    where: { userId },
  });
  
  await (prisma as any).privacyVerification.create({
    data: {
      userId,
      verifyType: body.type,
      verifiedAt: new Date(),
      expiresAt,
      sessionId: sessionData?.session?.id,
    },
  });

  return {
    success: true,
    message: "验证成功",
    expiresAt: expiresAt.toISOString(),
  };
});
