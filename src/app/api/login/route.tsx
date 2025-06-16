import { NextResponse } from "next/server";
import { serialize } from "cookie";

const FAKE_USER = { username: "jlatransport", password: "transjla" };

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username !== FAKE_USER.username || password !== FAKE_USER.password) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const token = "fake-token"; 

  const response = NextResponse.json({ message: "Login exitoso" });
  response.headers.set(
    "Set-Cookie",
    serialize("auth_token", token, { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 })
  );

  return response;
}
