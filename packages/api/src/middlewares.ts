import { ForbiddenError, HttpCServerMiddleware, PassthroughMiddleware, UnauthorizedError, useContextProperty, useRequestHeader } from "@httpc/server";

export function Authenticated(): HttpCServerMiddleware {
    return PassthroughMiddleware(() => {
        const [schema, value] = useRequestHeader("authorization")?.split(" ") || [];

        const secret = useContextProperty("SECRET_KEY");
        if (!secret) {
            throw new ForbiddenError("Missing auth configuration");
        }

        if (!schema || schema.toUpperCase() !== "SECRET" || value !== secret) {
            throw new UnauthorizedError();
        }
    });
}
