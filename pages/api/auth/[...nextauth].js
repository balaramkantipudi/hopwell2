
// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
// import clientPromise from "@/libs/mongo";
// import User from "@/models/User";
// import bcrypt from "bcrypt";
// import connectMongo from "@/libs/mongoose";

// // Export authOptions so it can be imported in other files
// export const authOptions = {
//   // Configure one or more authentication providers
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         await connectMongo();

//         // Find user
//         const user = await User.findOne({ email: credentials.email }).select('+password');
//         if (!user) {
//           throw new Error("No user found with this email");
//         }

//         // Check password
//         const isPasswordCorrect = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!isPasswordCorrect) {
//           throw new Error("Password is incorrect");
//         }

//         return {
//           id: user._id.toString(),
//           email: user.email,
//           name: user.name,
//           image: user.image,
//         };
//       },
//     }),
//   ],
//   adapter: MongoDBAdapter(clientPromise),
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET,
//   },
//   pages: {
//     signIn: "/auth/signin",
//     signUp: "/auth/signup",
//     error: "/auth/error",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user.id = token.id;
//       return session;
//     },
//   },
// };

// export default NextAuth(authOptions);
// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/libs/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import connectMongo from "@/libs/mongoose";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          googleId: profile.sub,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongo();

        // Find user
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) {
          throw new Error("No user found with this email");
        }

        // If no password (Google login), reject
        if (!user.password) {
          throw new Error("Please sign in with Google");
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Password is incorrect");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser, trigger, session }) {
      // If signing in
      if (user) {
        token.id = user.id;
        
        // If user has selected "Remember me", extend the session
        if (trigger === 'signIn' && account?.remember === 'true') {
          token.remember = true;
        }
      }
      
      // If it's a session update
      if (trigger === 'update' && session?.remember) {
        token.remember = session.remember;
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      
      // If remember me is set, extend the session expiry
      if (token.remember) {
        session.maxAge = 90 * 24 * 60 * 60; // 90 days
      } else {
        session.maxAge = 30 * 24 * 60 * 60; // 30 days
      }
      
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);