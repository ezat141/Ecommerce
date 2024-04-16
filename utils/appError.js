class AppError extends Error {
    constructor() {
        super();
    }

    create(message, statusCode, statusText) {
            this.message = message;
            this.statusCode = statusCode;
            this.statusText = statusText;
            //Error.captureStackTrace(this, this.constructor);//Captures a stack trace for the AppError instance. This is useful for debugging purposes, as it helps identify where the error occurred in the code.
            return this;
    }
}

module.exports = new AppError();