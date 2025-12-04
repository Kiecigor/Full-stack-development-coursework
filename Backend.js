require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

// --------------------------------------
// EXPRESS SETUP
// --------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// --------------------------------------
// MONGODB CLIENT
// --------------------------------------
const client = new MongoClient(process.env.MONGO_URI);

let classesCollection;

// Async wrapper to simplify route error-handling
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Validate ObjectId middleware
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }
  next();
};

// --------------------------------------
// CONNECT TO MONGO
// --------------------------------------
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("Schoolclasses");
    classesCollection = db.collection("Schoolclasses");

    await classesCollection.createIndex({ name: "text", description: "text" });

    await seedData();
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
}

async function seedData() {
  try {
    const count = await classesCollection.countDocuments();
    if (count === 0) {
      await classesCollection.insertMany([
        { name: "Java programming", price: 15, description: "Learn how to code with Java", image: "../Images/Java.jpg", location: "Online", seats: 30, createdAt: new Date() },
        { name: "Artificial Intelligence", price: 25, description: "Learn more about AI", image: "../Images/AI.jpg", location: "London Campus", seats: 30, createdAt: new Date() },
        { name: "Data Science and Machine Learning", price: 20, description: "Learn machine learning", image: "../Images/Machine.jpg", location: "Manchester Campus", seats: 30, createdAt: new Date() },
        { name: "Information in Organisations", price: 10, description: "Learn SQL and databases", image: "../Images/SQL.jpg", location: "Online", seats: 30, createdAt: new Date() },
        { name: "Web Development", price: 30, description: "Build modern websites", image: "../Images/web.jpg", location: "London Campus", seats: 30, createdAt: new Date() },
      ]);
      console.log("🌱 Database seeded");
    }
  } catch (err) {
    console.error("❌ Seed Error:", err);
  }
}

connectDB();

// --------------------------------------
// API ROUTES FOR LOCALHOST
// --------------------------------------

// GET all classes
app.get("/api/classes", asyncHandler(async (req, res) => {
  const classes = await classesCollection.find({}).toArray();
  res.status(200).json(classes);
}));

// POST add a class
app.post("/api/classes", asyncHandler(async (req, res) => {
  const { name, price, description, location, seats } = req.body;

  if (!name || typeof price !== "number" || !description || !location || typeof seats !== "number") {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing data",
    });
  }

  const newClass = {
    name,
    price,
    description,
    location,
    seats,
    image: req.body.image || "",
    createdAt: new Date(),
  };

  const result = await classesCollection.insertOne(newClass);

  res.status(201).json({
    success: true,
    data: { _id: result.insertedId, ...newClass },
  });
}));

// --------------------------------------
// BOOK SEAT
// --------------------------------------
app.post("/api/classes/:id/book", validateObjectId, asyncHandler(async (req, res) => {
  const id = new ObjectId(req.params.id);

  const result = await classesCollection.findOneAndUpdate(
    { _id: id, seats: { $gt: 0 } },
    { $inc: { seats: -1 } },
    { returnDocument: "after" }
  );

  if (!result.value) {
    return res.status(400).json({ success: false, error: "No seats available or class not found" });
  }

  res.json({ success: true, seats: result.value.seats });
}));

// --------------------------------------
// UNBOOK SEAT
// --------------------------------------
app.post("/api/classes/:id/unbook", validateObjectId, asyncHandler(async (req, res) => {
  const id = new ObjectId(req.params.id);

  const result = await classesCollection.findOneAndUpdate(
    { _id: id },
    { $inc: { seats: 1 } },
    { returnDocument: "after" }
  );

  if (!result.value) return res.status(404).json({ success: false, error: "Class not found" });

  res.json({ success: true, seats: result.value.seats });
}));

// --------------------------------------
// ERROR HANDLERS
// --------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// --------------------------------------
// START SERVER ON LOCALHOST
// --------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running locally at: http://localhost:${3000}`);
});
