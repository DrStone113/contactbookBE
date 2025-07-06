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

// ✅ Cấu hình CORS chỉ cho phép domain cụ thể
const allowedOrigins = ["https://drstone.id.vn", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // ✅ Cho phép gọi từ Postman, curl, server-to-server (no Origin)
      if (!origin || origin === "null") {
        console.log("✅ CORS allowed: no origin or 'null' (curl, Postman)");
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log("✅ CORS allowed:", origin);
        return callback(null, true);
      } else {
        console.warn("❌ CORS blocked:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  })
);

// ✅ Giới hạn số lần gọi API (Rate limiting)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// ✅ Cấu hình giới hạn size upload
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Route chính
app.get("/", (req, res) => {
  return res.json(JSend.success());
});

// ✅ Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ Tĩnh
app.use("/public", express.static("public"));

// ✅ Các routes chính
contactsRouter.setup(app);

// ✅ Xử lý 404
app.use(resourceNotFound);

// ✅ Middleware xử lý lỗi tổng quát
app.use(handleError);

module.exports = app;
