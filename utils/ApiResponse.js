import { SUCCESS } from "../constant.js";
import { OK } from "./httpStatusCode.js";

class ApiResponse {
  constructor(statusCode, message = SUCCESS, data, error) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.status = statusCode != OK ? false : true;
    if (error) {
      this.error = error;
    }
  }
}
export { ApiResponse };
