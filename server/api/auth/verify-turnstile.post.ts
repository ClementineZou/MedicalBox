import { verifyTurnstileToken, getClientIp } from "~/server/utils/turnstile";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { token } = body;

    if (!token) {
        throw createError({
            statusCode: 400,
            message: "缺少验证码 token",
        });
    }

    try {
        const clientIp = getClientIp(event);
        const isValid = await verifyTurnstileToken(token, clientIp);

        if (!isValid) {
            return {
                success: false,
                message: "验证码验证失败",
            };
        }

        return {
            success: true,
            message: "验证成功",
        };
    } catch (error: any) {
        console.error("Turnstile verification error:", error);
        throw createError({
            statusCode: 500,
            message: "验证码验证失败",
        });
    }
});
