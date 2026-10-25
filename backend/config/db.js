const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (
        typeof uri !== "string" ||
        (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))
    ) {
        throw new Error(
            "MONGO_URI must start with mongodb:// or mongodb+srv://"
        );
    }
    try {
        await mongoose.connect(uri);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Error:", error.message);
        throw error;
    }
};

module.exports = connectDB;