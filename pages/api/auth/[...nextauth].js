import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import connectMongo from "@/libs/mongo";
import config from "@/config";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../libs/auth"; // Assuming you have a utility for password verification
import { connectToDatabase } from "../../../libs/mongo";

export const authOptions = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin", // Update this path if your custom sign-in page is located elsewhere
  },

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const client = await connectToDatabase();
        const usersCollection = client.db().collection("users");

        const user = await usersCollection.findOne({
          email: credentials.email,
        });
        if (!user) {
          client.close();
          throw new Error("No user found with the email");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) {
          client.close();
          throw new Error("Password is incorrect");
        }

        client.close();
        return { email: user.email };
      },
    }),
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    // // Follow the "Login with Email" tutorial to set up your email server
    // EmailProvider({
    //   server: process.env.EMAIL_SERVER,
    //   from: config.mailgun.fromNoReply,
    // }),
  ],
  database: process.env.DATABASE_URL,
  // callbacks: {
  //   async signIn(user, account, profile) {
  //     const db = await connectToDatabase();
  //     const usersCollection = db.collection("users");

  //     // Check if user already exists
  //     const existingUser = await usersCollection.findOne({ email: user.email });

  //     if (existingUser) {
  //       // Update user record if necessary
  //       // ...
  //       return true;
  //     } else {
  //       // Create new user record
  //       await usersCollection.insertOne({
  //         email: user.email,
  //         name: user.name,
  //         image: user.image,
  //         createdAt: new Date(),
  //         // Add other user properties
  //       });
  //       return true; // Return true to allow sign-in
  //     }
  //   },
  // },
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc.. Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  adapter: MongoDBAdapter(connectMongo),
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    //logo: `https://${config.domainName}/logo.png`,
  },
};

console.log(process.env.MONGODB_URI);

export default NextAuth(authOptions);
