import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image"; // Import the Image component
import { useState } from "react";

export default function SignIn({ providers }) {
  if (!providers)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State to store error messages

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message on new submission

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent redirect
      callbackUrl: "/",
    });

    if (result.error) {
      console.log("Error Message:" + result.error);
      setErrorMessage("Failed to sign in. Please check your credentials.");
    } else {
      window.location.href = result.url || "/";
    }
  };

  // const handleCredentialsSignIn = (e) => {
  //   e.preventDefault();
  //   signIn("credentials", {
  //     email,
  //     password,
  //     callbackUrl: "/",
  //   });
  // };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="mb-4">
        {" "}
        {/* Add some margin-bottom */}
        <Image
          src="/logo.png" // Adjust the path to your logo
          alt="Logo" // Provide an appropriate alt text
          width={150} // Adjust the size as needed
          height={150}
        />
      </div>
      <form onSubmit={handleCredentialsSubmit} className="my-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 mb-2" // Added margin-bottom
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-2 mb-2 mr-2 ml-2" // Added margin-bottom
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded my-2"
        >
          Sign in with Email
        </button>
      </form>
      {Object.values(providers).map((provider) => {
        if (provider.id !== "credentials") {
          return (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded my-2"
            >
              Sign in with {provider.name}
            </button>
          );
        }
      })}
      {errorMessage && (
        <div className="text-red-500 mt-2">{errorMessage}</div> // Error message styled in red
      )}

      <Link
        href="/auth/signup"
        className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
        passHref
      >
        Don't have an account? Sign Up
      </Link>
    </div>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
