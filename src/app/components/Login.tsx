"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  const ejecutarSignalr = async () => {
    const res = await fetch("https://sub.velsat.pe:8586/api/Login/login", {
      method: "POST",
      body: JSON.stringify({
        login: "jlatransport",
        clave: "transjla",
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Token:", data.token);
      console.log("Username:", data.username); 
    } else {
      console.log("Error al ejecutar Signalr:", await res.text());
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username: usuario, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
    });

    if (res.ok) {
      router.push("/dashboard"); 
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="relative w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Inicio de sesión</h2>
        <p className="text-center text-gray-400 mb-6">Accede a tu panel de rastreo GPS</p>

        <form className="relative z-10" onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm mb-2">Usuario</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Escriba su Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button onClick={ejecutarSignalr} className="w-full bg-blue-600 hover:bg-blue-500 transition p-2 rounded-lg font-semibold">
            Iniciar sesión
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
