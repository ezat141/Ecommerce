require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // join a set of files together
const url = process.env.MONGO_URL;
const cors = require("cors");
const httpStatusText = require("./utils/httpStatusText");
const fs = require('fs');


//const badyParser = require('bady-parser');
const homeRoutes = require("./routes/homeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const forgetPasswordRoutes = require("./routes/forgetPasswordRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const addressRoutes = require("./routes/addressRoutes");
const couponRoutes = require("./routes/couponRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const deliveryAuthRoutes = require("./routes/deliveryAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");

const cartRoutes = require("./routes/cartRoutes");
const { authMiddleware } = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));
// Routes
app.use("/auth", authRoutes);
app.use("/forgetPassword", forgetPasswordRoutes);
app.use("/", homeRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes); // Add order routes
app.use("/address", addressRoutes);
app.use("/cart", cartRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/coupons", couponRoutes); // Add this line
app.use("/delivery", deliveryRoutes); // Add this line
app.use("/deliveryAuth", deliveryAuthRoutes); // Add this line
app.use("/admin", adminRoutes);

// MongoDB Connection
mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err.message));

// global error handler
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "This resource is not available",
  });
});

// global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
