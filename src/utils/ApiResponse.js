class ApiResponse {
    constructor(statusCode, data, message = "Request successful") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode >= 200 && statusCode < 300; // success is true for status codes in the range of 200-299
    }
}
export {ApiResponse};