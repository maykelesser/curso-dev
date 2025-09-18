import {
    InternalServerError,
    MethodNotAllowedError,
    ValidationError,
    NotFoundError,
} from "infra/errors";

function onNoMatchHandler(req, res) {
    const publicErrorObject = new MethodNotAllowedError();
    return res.status(publicErrorObject.status_code).json(publicErrorObject);
}

function onErrorHandler(error, req, res) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
        return res.status(error.status_code).json(error);
    }

    const publicErrorObject = new InternalServerError({
        statusCode: error.status_code,
        cause: error,
    });
    console.error(`Controller error:`);
    console.error(publicErrorObject);
    return res.status(publicErrorObject.status_code).json(publicErrorObject);
}

const controller = {
    errorHandlers: {
        onNoMatch: onNoMatchHandler,
        onError: onErrorHandler,
    },
};

export default controller;
