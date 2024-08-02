class ErrorHandlerClass {
    constructor(message, statusCode, data, location, stack) {
        (this.message = message),
            (this.statusCode = statusCode),
            (this.stack = stack ? stack : null),
            (this.data = data ? data : null),
            (this.location = location ? location : "Error");
    }
}

export { ErrorHandlerClass };
