import { auth } from "~/lib/auth";
import { verifyTurnstileToken, getClientIp } from "~/server/utils/turnstile";

export default defineEventHandler(async (event) => {
    const request = toWebRequest(event);
    const url = new URL(request.url);
    const path = url.pathname;

    // 检查是否是登录或注册请求
    const requiresTurnstile = 
        path.includes("/sign-in/email") || 
        path.includes("/sign-up/email");

    if (requiresTurnstile && request.method === "POST") {
        try {
            const body = await readBody(event);
            const turnstileToken = body.turnstileToken;

            if (!turnstileToken) {
                throw createError({
                    statusCode: 400,
                    message: "缺少验证码 token",
                });
            }

            // 验证 Turnstile token
            const clientIp = getClientIp(event);
            const isValid = await verifyTurnstileToken(turnstileToken, clientIp);

            if (!isValid) {
                throw createError({
                    statusCode: 400,
                    message: "验证码验证失败，请重试",
                });
            }

            // 从请求体中移除 turnstileToken，避免传递给 better-auth
            delete body.turnstileToken;
            
            // 重新创建请求对象，包含修改后的 body
            const modifiedRequest = new Request(request.url, {
                method: request.method,
                headers: request.headers,
                body: JSON.stringify(body),
            });

            return auth.handler(modifiedRequest);
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            throw createError({
                statusCode: 500,
                message: "服务器错误",
            });
        }
    }

    // 其他请求直接传递给 better-auth
    return auth.handler(request);
});

