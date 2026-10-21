// Express 4 doesn't catch rejected promises from async route handlers on its own.
// Wrapping a handler in this passes any thrown/rejected error to next(err),
// so it reaches the centralized error handler in server.js instead of hanging the request.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
