"use client";
import { useState } from "react";

export default function FacebookLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      // Request OAuth URL from Next.js API
      const response = await fetch("/api/v1/connect?platform=facebook");
      const data = await response.json();

      if (!data.oauth_url) {
        throw new Error("Failed to retrieve OAuth URL");
      }

      // Open a popup window for Facebook login
      const width = 600;
      const height = 700;

      window.open(
        data.oauth_url,
        "Facebook Login",
        `width=${width},height=${height},resizable=no,scrollbars=no`
      );
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Facebook OAuth Login
        </h2>

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login with Facebook"}
        </button>
      </div>
    </div>
  );
}
