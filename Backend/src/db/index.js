import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/liveChat`
    );
    console.log(
      `MONGODB is connected successfully !!\nDB HOST:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGO Connection Error : ", error);
    process.exit(1);
  }
};

export default connectDB;
