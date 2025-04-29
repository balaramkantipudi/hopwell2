import { MongoClient } from "mongodb";
// This lib is use just to connect to the database in next-auth. We don't use it anywhere else in the API routes. See [...nextauth].js file.
console.log("MongoDB URI: ", process.env.MONGODB_URI); // Debugging line
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbInstance = null;

let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  await client.connect();
  return client;
}

export default clientPromise;
