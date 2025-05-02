// import { MongoClient } from "mongodb";
// // This lib is use just to connect to the database in next-auth. We don't use it anywhere else in the API routes. See [...nextauth].js file.
// console.log("MongoDB URI: ", process.env.MONGODB_URI); // Debugging line
// if (!process.env.MONGODB_URI) {
//   throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
// }

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// let dbInstance = null;

// let clientPromise;

// if (process.env.NODE_ENV === "development") {
//   if (!global._mongoClientPromise) {
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   clientPromise = client.connect();
// }

// export async function connectToDatabase() {
//   await client.connect();
//   return client;
// }

// export default clientPromise;


// libs/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;