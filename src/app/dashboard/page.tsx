// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import GPSTrackerDashboard from "../components/GPSTrackerDashboard";

export default async function Dashboard() {
  // const authToken = (await cookies()).get("auth_token");

  // if (!authToken) {
  //   redirect("/");
  // }

  return (
    <>
      <GPSTrackerDashboard />
    </>
  );
}
