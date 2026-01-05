


// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);

    // Enable change streams for real-time sync
    const db = mongoose.connection;

    // Watch for changes in all collections
    const changeStream = db.watch();

    changeStream.on("change", (change) => {
      console.log("📊 Database change detected:", change.operationType);
      global.dbChangeStream = change;
    });

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
