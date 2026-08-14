import dotenv from "dotenv";
import connectDb from "./src/config/dataBase.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed ERROR:", error);
    process.exit(1);
  }
};

startServer();