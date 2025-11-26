import { createAuthClient } from "better-auth/vue";
import { twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    plugins: [
        twoFactorClient(),
        passkeyClient(),
    ],
});

// Export specific methods for convenience
export const { 
    signIn, 
    signUp, 
    signOut, 
    useSession,
    twoFactor,
    passkey,
} = authClient;
