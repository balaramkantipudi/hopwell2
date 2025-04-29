import { useState } from "react";
import Router from "next/router";
import Image from "next/image"; // Import the Image component

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // Reset error message
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // Redirect to sign-in page or other page
      Router.push("/auth/signin");
    } else {
      // Handle errors
      const errorData = await res.json();
      setErrorMessage(errorData.message || "Signup failed");
      return;
    }
  };

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
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="my-2 p-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (Length > 7)"
          className="my-2 p-2"
        />
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
