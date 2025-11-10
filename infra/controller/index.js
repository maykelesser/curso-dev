import * as cookie from "cookie";
import users from "models/user";
import sessions from "models/session";
import authorization from "models/authorization";
import {
    InternalServerError,
    MethodNotAllowedError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
} from "infra/errors";

function onNoMatchHandler(req, res) {
    const publicErrorObject = new MethodNotAllowedError();
    return res.status(publicErrorObject.status_code).json(publicErrorObject);
}

function onErrorHandler(error, req, res) {
    if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError
    ) {
        return res.status(error.status_code).json(error);
    }

    if (error instanceof UnauthorizedError) {
        clearSessionCookie(res);
        return res.status(error.status_code).json(error);
    }

    const publicErrorObject = new InternalServerError({
        cause: error,
    });
    console.error(`Controller error:`);
    console.error(publicErrorObject);
    return res.status(publicErrorObject.status_code).json(publicErrorObject);
}

function setSessionCookie(sessionToken, res) {
    const setCookie = cookie.serialize("session_id", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessions.EXPIRATION_IN_MILLISECONDS / 1000,
    });

    res.setHeader("Set-Cookie", setCookie);
}

function clearSessionCookie(res) {
    const setCookie = cookie.serialize("session_id", "invalid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: -1,
    });

    res.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(req, res, next) {
    if (req.cookies?.session_id) {
        await injectAuthenticatedUser(req);
        return next();
    }

    injectAnonymousUser(req);
    return next();
}

async function injectAuthenticatedUser(req) {
    const sessionToken = req.cookies.session_id;
    const session = await sessions.findOneValidByToken(sessionToken);
    const userObject = await users.findOneById(session.user_id);

    req.context = {
        ...req.context,
        user: userObject,
    };
}

function injectAnonymousUser(req) {
    const anonymousUserObject = {
        features: ["read:activation_token", "create:session", "create:user"],
    };

    req.context = {
        ...req.context,
        user: anonymousUserObject,
    };
}

function canRequest(feature) {
    return function canRequestMiddleware(req, res, next) {
        const userTryingToRequest = req.context.user;

        if (authorization.can(userTryingToRequest, feature)) {
            return next();
        }

        throw new ForbiddenError({
            message: "Forbidden Access",
            action: `Check your user features if you have access to this resource: ${feature}`,
        });
    };
}

const controller = {
    setSessionCookie,
    clearSessionCookie,
    errorHandlers: {
        onNoMatch: onNoMatchHandler,
        onError: onErrorHandler,
    },
    injectAnonymousOrUser,
    canRequest,
};

export default controller;
