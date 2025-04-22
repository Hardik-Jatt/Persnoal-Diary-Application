const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/diary?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Sample Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🌐 Server is listening on http://localhost:${PORT}`);
});
