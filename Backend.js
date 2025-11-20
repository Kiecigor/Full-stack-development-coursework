require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

// ---------------------------
// EXPRESS SETUP
// ---------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------
// MONGODB NATIVE DRIVER
// ---------------------------
const client = new MongoClient(process.env.MONGO_URI);

let classesCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("Schoolclasses");
    classesCollection = db.collection("Schoolclasses");

    await seedData();
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

connectDB();

// ---------------------------
// SEED DATABASE
// ---------------------------
async function seedData() {
  const count = await classesCollection.countDocuments();
  if (count === 0) {
    await classesCollection.insertMany([
      { name: "Java programming", price: 15, description: "Learn how to code with Java", image: "../Images/Java.jpg", location: "Online", seats: 30 },
      { name: "Artificial Intelligence", price: 25, description: "Learn more about AI", image: "../Images/AI.jpg", location: "London Campus", seats: 30 },
      { name: "Data Science and Machine Learning", price: 20, description: "Learn machine learning", image: "../Images/Machine.jpg", location: "Manchester Campus", seats: 30 },
      { name: "Information in Organisations", price: 10, description: "Learn SQL and databases", image: "../Images/SQL.jpg", location: "Online", seats: 30 },
      { name: "Web Development", price: 30, description: "Build modern websites", image: "../Images/web.jpg", location: "London Campus", seats: 30 },
      { name: "Cybersecurity Fundamentals", price: 18, description: "Protect systems and data", image: "../Images/Cyber.jpg", location: "Online", seats: 30 },
      { name: "Cloud Computing", price: 22, description: "Explore cloud tech", image: "../Images/cloud.jpg", location: "London Campus", seats: 30 },
      { name: "Mobile App Development", price: 28, description: "Build Android/iOS apps", image: "../Images/Mobile.jpg", location: "London Campus", seats: 30 },
      { name: "Blockchain Technology", price: 35, description: "Learn blockchain", image: "../Images/Blockchain.jpg", location: "Online", seats: 30 },
      { name: "UI/UX Design", price: 12, description: "Learn UI/UX design", image: "../Images/UI.jpg", location: "London Campus", seats: 30 }
    ]);
    console.log("🌱 Database seeded");
  }
}

// ---------------------------
// API ROUTES
// ---------------------------

// Get all classes
app.get("/api/classes", async (req, res) => {
  try {
    const classes = await classesCollection.find({}).toArray();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Add class
app.post("/api/classes", async (req, res) => {
  try {
    const result = await classesCollection.insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(400).json({ error: "Error adding class" });
  }
});

// Search classes
app.get("/api/classes/search", async (req, res) => {
  try {
    const name = req.query.name || "";
    const results = await classesCollection
      .find({ name: { $regex: name, $options: "i" } })
      .toArray();

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Book seat
app.post("/api/classes/:id/book", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);

    const cls = await classesCollection.findOne({ _id: id });
    if (!cls) return res.json({ success: false, error: "Class not found" });

    if (cls.seats <= 0)
      return res.json({ success: false, error: "No seats left" });

    await classesCollection.updateOne(
      { _id: id },
      { $inc: { seats: -1 } }
    );

    res.json({ success: true, seats: cls.seats - 1 });
  } catch (err) {
    res.status(500).json({ success: false, error: "Booking failed" });
  }
});

// Unbook seat
app.post("/api/classes/:id/unbook", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);

    await classesCollection.updateOne(
      { _id: id },
      { $inc: { seats: 1 } }
    );

    const updated = await classesCollection.findOne({ _id: id });

    res.json({ success: true, seats: updated.seats });
  } catch (err) {
    res.status(500).json({ success: false, error: "Unbooking failed" });
  }
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
);