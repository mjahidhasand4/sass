import { auth } from "@/auth";

const getApps = async () => {
  const response = await fetch("http://localhost:3000/api/v1/channel", {
    credentials: "include", // ✅ Ensures cookies are sent
  });
  return response.json();
};

const Apps = async () => {
  const session = await auth();
  console.log("Session: ", session);
  const apps = await getApps();
  return <main>{JSON.stringify(apps)}</main>;
};

export default Apps;
