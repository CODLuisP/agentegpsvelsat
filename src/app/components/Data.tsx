'use client';

import React, { useEffect, useState } from 'react';

interface Pasajero {
  accountID: string;
  password: string;
  description: string;
}

export default function Data() {
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPasajeros = async () => {
      try {
        const res = await fetch('https://velsat.pe:8586/api/User');
        const data = await res.json();
        setPasajeros(data);
      } catch (error) {
        console.error('Error al cargar pasajeros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPasajeros();
  }, []);

  return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">🧍 Lista de Pasajeros</h1>

      {loading ? (
        <p className="text-center text-gray-500">Cargando pasajeros...</p>
      ) : pasajeros.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pasajeros.map((p) => (
            <div
              key={p.accountID}
              className="bg-white shadow-md rounded-2xl p-4 border border-blue-100 hover:shadow-lg transition"
            >
              <p className="text-sm text-gray-500">Código: #{p.accountID}</p>
              <p className="text-lg font-semibold text-blue-800">{p.password}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-red-500">No se encontraron pasajeros.</p>
      )}
    </div>
  );
}
