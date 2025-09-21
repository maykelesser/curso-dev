import * as cookie from "cookie";
import sessions from "models/session";
import {
    InternalServerError,
    MethodNotAllowedError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
} from "infra/errors";

function onNoMatchHandler(req, res) {
    const publicErrorObject = new MethodNotAllowedError();
    return res.status(publicErrorObject.status_code).json(publicErrorObject);
}

function onErrorHandler(error, req, res) {
    if (
        error instanceof ValidationError ||
        error instanceof NotFoundError
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

const controller = {
    setSessionCookie,
    clearSessionCookie,
    errorHandlers: {
        onNoMatch: onNoMatchHandler,
        onError: onErrorHandler,
    },
};

export default controller;
