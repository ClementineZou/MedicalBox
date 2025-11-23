/**
 * Cloudflare Turnstile 验证工具
 */

interface TurnstileValidationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

/**
 * 验证 Cloudflare Turnstile token
 * @param token - 客户端返回的 Turnstile token
 * @param remoteIp - 用户的 IP 地址（可选）
 * @returns 验证是否成功
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    const data: TurnstileValidationResponse = await response.json();

    if (!data.success) {
      console.error("Turnstile validation failed:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}

/**
 * 从请求中提取客户端 IP 地址
 * @param event - Nuxt H3 事件对象
 * @returns IP 地址
 */
export function getClientIp(event: any): string | undefined {
  const headers = event.node.req.headers;
  
  // 尝试从常见的代理头中获取真实 IP
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const ips = typeof forwarded === "string" ? forwarded.split(",") : forwarded;
    return ips[0].trim();
  }

  const realIp = headers["x-real-ip"];
  if (realIp) {
    return typeof realIp === "string" ? realIp : realIp[0];
  }

  const cfConnectingIp = headers["cf-connecting-ip"];
  if (cfConnectingIp) {
    return typeof cfConnectingIp === "string" ? cfConnectingIp : cfConnectingIp[0];
  }

  return event.node.req.socket.remoteAddress;
}
