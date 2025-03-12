import { auth } from "@/auth";
import { cookies } from "next/headers";

const getApps = async (session) => {
  if (!session) {
    throw new Error("Unauthorized");
  }

  const cookieHeader = cookies()
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const response = await fetch("http://localhost:3000/api/v1/channel", {
    headers: {
      Cookie: cookieHeader, // ✅ Correctly format cookies
    },
    credentials: "include", // ✅ Ensure cookies are included
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch apps. Status: ${response.status}`);
  }

  return response.json();
};

const Apps = async () => {
  try {
    const session = await auth();

    if (!session) {
      return (
        <main className="p-4">
          <h1 className="text-xl font-bold">Unauthorized</h1>
          <p>Please sign in to view this page.</p>
        </main>
      );
    }

    const apps = await getApps(session);

    return (
      <main className="p-4">
        <h1 className="text-xl font-bold">Your Connected Apps</h1>
        <pre>{JSON.stringify(apps, null, 2)}</pre>
      </main>
    );
  } catch (error) {
    return (
      <main className="p-4">
        <h1 className="text-xl font-bold">Error</h1>
        <p>
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </p>
      </main>
    );
  }
};

export default Apps;
