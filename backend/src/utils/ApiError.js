class ApiError extends Error {
  constructor(message = "Something went wrong", statusCode, error = [], stack) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.errors = errors;
    this.success = false;
  }
}

export { ApiError };
