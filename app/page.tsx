"use client";
import FacebookLogin from "@/components/facebook";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Define custom session type
interface CustomUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as CustomUser;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-500">
            Please wait while we load your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <FacebookLogin />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{user.phone || "Not available"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {user.dateOfBirth || "Not available"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">
                    {user.gender || "Not available"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-xs truncate">
                    {user.id || "Not available"}
                  </p>
                </div>
              </div>
            ) : (
              <p>No user information available</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            This is a protected page that can only be accessed by authenticated
            users. Your authentication is handled by Auth.js integrated with
            Supabase.
          </p>
          <p className="text-gray-600">
            Your phone number was verified using OTP before your account was
            created.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;
