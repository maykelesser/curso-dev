export class InternalServerError extends Error {
    constructor({ cause, statusCode }) {
        super("An unexpected error occurred", {
            cause,
        });
        this.name = "InternalServerError";
        this.action =
            "Try again in 5 minutes. If the error continues, please contact our support";
        this.status_code = statusCode || 500;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.status_code,
        };
    }
}

export class ServiceError extends Error {
    constructor({ cause, message }) {
        super(message || "Service unavailable", {
            cause,
        });
        this.name = "ServiceError";
        this.action =
            "Try again in 5 minutes. Check if the service is currently available";
        this.status_code = 503;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.status_code,
        };
    }
}

export class ValidationError extends Error {
    constructor({ cause, message, action }) {
        super(message || "Validation error", {
            cause,
        });
        this.name = "ValidationError";
        this.action = action || "Check the request parameters";
        this.status_code = 400;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.status_code,
        };
    }
}

export class NotFoundError extends Error {
    constructor({ cause, message, action }) {
        super(message || "Not found", {
            cause,
        });
        this.name = "NotFoundError";
        this.action = action || "Check the request parameters";
        this.status_code = 404;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.status_code,
        };
    }
}

export class MethodNotAllowedError extends Error {
    constructor() {
        super("Method not allowed to this endpoint");
        this.name = "MethodNotAllowedError";
        this.action = "Check if the HTTP method is valid for this endpoint";
        this.status_code = 405;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            action: this.action,
            status_code: this.status_code,
        };
    }
}
