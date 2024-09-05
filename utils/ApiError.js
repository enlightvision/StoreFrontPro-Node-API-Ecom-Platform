class ApiError {
  constructor(
    statusCode,
    message = "Something Went Wrong",
    errors = '',
  ) {
    this.statusCode = statusCode;
    this.data = null;
    this.errors = errors;
    this.message = message;
    this.status = false;
  }
}
 
export { ApiError };








// class ApiError extends Error {
//   constructor(
//     statusCode,
//     message = "Something Went Wrong",
//     errors = [],
//     stack = ""
//   ) {
//     super(message);
//     this.statusCode = statusCode;
//     this.data = null;
//     this.errors = errors;
//     this.message = message;
//     this.status = false;

//     if (stack) {
//       this.stack = stack;
//     } else {
//       Error.captureStackTrace(this, this.constructor);
//     }
//   }
// }

// export { ApiError };
