import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const response = NextResponse.json({ message: "Logout exitoso" });
  response.headers.set(
    "Set-Cookie",
    serialize("auth_token", "", { path: "/", httpOnly: true, maxAge: 0 })
  );
  return response;
}
