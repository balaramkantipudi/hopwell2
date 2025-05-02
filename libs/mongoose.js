// import mongoose from "mongoose";
// import User from "@/models/User";

// const connectMongo = async () =>
//   mongoose
//     .connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .catch((e) => console.error("Mongoose Client Error: " + e.message));

// export default connectMongo;
// libs/mongoose.js
import mongoose from 'mongoose';

const connectMongo = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default connectMongo;