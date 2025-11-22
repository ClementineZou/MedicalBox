import { authClient } from "~/lib/auth-client";

export const useAuth = () => {
    const session = authClient.useSession();

    const login = async (email: string, password: string) => {
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message || "登录失败");
        }

        return data;
    };

    const register = async (email: string, password: string, name?: string) => {
        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name: name || "",
        });

        if (error) {
            throw new Error(error.message || "注册失败");
        }

        return data;
    };

    const logout = async () => {
        await authClient.signOut();
        // Redirect to home page
        navigateTo("/");
    };

    const loginWithGithub = async () => {
        await authClient.signIn.social({
            provider: "github",
            callbackURL: "/",
        });
    };

    return {
        session,
        user: computed(() => session.value?.data?.user),
        isAuthenticated: computed(() => !!session.value?.data?.user),
        isLoading: computed(() => session.value?.isPending || false),
        login,
        register,
        logout,
        loginWithGithub,
    };
};
