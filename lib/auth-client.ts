import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
});

// Export specific methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;
