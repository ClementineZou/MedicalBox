import { auth } from "~/lib/auth";
import type { H3Event } from "h3";

/**
 * Get the authenticated user from the session
 * Throws error if user is not authenticated
 */
export async function requireUser(event: H3Event) {
    const session = await auth.api.getSession({
        headers: event.headers,
    });

    if (!session?.user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized - Please log in",
        });
    }

    return session.user;
}

/**
 * Get the authenticated user's ID
 * Throws error if user is not authenticated
 */
export async function requireUserId(event: H3Event): Promise<string> {
    const user = await requireUser(event);
    return user.id;
}

/**
 * Try to get the authenticated user (optional)
 * Returns null if not authenticated
 */
export async function getOptionalUser(event: H3Event) {
    try {
        const session = await auth.api.getSession({
            headers: event.headers,
        });
        return session?.user || null;
    } catch {
        return null;
    }
}
