import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),

    secret: process.env.BETTER_AUTH_SECRET || "75740947d1dd09d67820899225b362d7",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true if you want email verification
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },

    // Cloudflare Turnstile configuration
    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        crossSubDomainCookies: {
            enabled: false,
        },
    },

    // Better Auth 使用 plugins 来扩展功能，包括 turnstile
    // 但在当前版本中，turnstile 可能需要手动在 API 路由中验证
    // 或者直接在配置中添加（如果支持的话）
});
