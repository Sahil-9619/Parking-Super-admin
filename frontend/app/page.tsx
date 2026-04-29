'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [dbStatus, setDbStatus] = useState<{ status: string; time?: string; message?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/db-status`)
      .then((res) => res.json())
      .then((data) => {
        setDbStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        setDbStatus({ status: 'error', message: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold mb-8">Parking Super Admin</h1>
        
        <div className="p-6 rounded-xl border border-gray-700 bg-gray-800 w-full max-w-md text-center">
          <h2 className="text-xl mb-4 font-semibold">Database Connection Status</h2>
          {loading ? (
            <p className="text-blue-400 animate-pulse">Checking connection...</p>
          ) : dbStatus?.status === 'connected' ? (
            <div className="text-green-400">
              <p className="text-2xl font-bold">Connected!</p>
              <p className="mt-2 text-xs text-gray-400">Server Time: {dbStatus.time}</p>
            </div>
          ) : (
            <div className="text-red-400">
              <p className="text-2xl font-bold">Error</p>
              <p className="mt-2 text-xs text-gray-400">{dbStatus?.message || 'Could not connect to backend'}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
            <p className="font-bold">Frontend</p>
            <p className="text-xs text-gray-400">Next.js (Port 3000)</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
            <p className="font-bold">Backend</p>
            <p className="text-xs text-gray-400">Express (Port 5000)</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
            <p className="font-bold">Database</p>
            <p className="text-xs text-gray-400">PostgreSQL (Port 5432)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
