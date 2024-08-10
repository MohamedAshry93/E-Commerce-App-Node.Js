class ErrorHandlerClass {
    constructor(message, statusCode, data, location, stack) {
        (this.message = message),
            (this.statusCode = statusCode),
            (this.data = data ? data : null),
            (this.location = location ? location : "Error"),
            (this.stack = stack ? stack : null);
    }
}

export { ErrorHandlerClass };
