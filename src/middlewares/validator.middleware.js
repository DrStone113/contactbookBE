const { z } = require("zod");

const ApiError = require("../api-error");

/**
 * Validates the request object using the provided zod validator.
 *
 * @param {z.AnyZodObject} validator
 */
function validateRequest(validator) {
  return (req, res, next) => {
    try {
      let input = { ...req.params };
      if (req.method === "GET" || req.method === "DELETE") {
        input = { ...input, ...req.query };
      }
      if (req.method === "POST" || req.method === "PUT") {
        input = {
          ...input,
          ...(req.body ? req.body : {}),
          //...(req.file ? req.file : {}),
        };
        if (req.file && req.file.fieldname === "avatarFile") {
          input.avatarFile = req.file;
        }
      }
      validator.parse({ input });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const errorPath = issue.path.join(".");
          if (issue.code === z.ZodIssueCode.unrecognized_keys) {
            const invalidKeys = issue.keys.join(", ");
            return `${errorPath} contains invalid keys: ${invalidKeys}`;
          }
          return `${errorPath}: ${issue.message}`;
        });

        console.log("Zod validation errors:", errorMessages);
        return next(new ApiError(400, errorMessages.join("; ")));
      }
      return next(new ApiError(500, "Internal Server Error"));
    }
  };
}

module.exports = {
  validateRequest,
};
