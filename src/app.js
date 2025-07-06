const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const rateLimit = require("express-rate-limit");

const JSend = require("./jsend");
const contactsRouter = require("./routes/contacts.router");
const {
  resourceNotFound,
  handleError,
} = require("./controllers/errors.controller");
const app = express();
const swaggerDocument = require("../docs/openapiSpec.json");

// Rate limiting middleware: max 20 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests, please try again later.",
  },
});

app.use(cors());
// Update upload file size limit to 10MB.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply rate limiting middleware globally
app.use(limiter);

app.get("/", (req, res) => {
  return res.json(JSend.success());
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/public", express.static("public"));

contactsRouter.setup(app);

// Handle 404 error for unknown URL paths
app.use(resourceNotFound);

// Define the centralized error handling middleware, after all routes
// and middleware have been defined
app.use(handleError);

module.exports = app;
