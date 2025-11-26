import { auth } from "~/lib/auth";

export default defineEventHandler(async (event) => {
    const request = toWebRequest(event);
    return auth.handler(request);
});

