import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import JejakForm from "@/components/JejakForm";

export default function Jejak() {
  const [nama, setNama] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedNama = localStorage.getItem("nama");
      if (storedNama) setNama(storedNama);
    }
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-yellow-50 py-6 px-4">
        <div className="max-w-4xl mx-auto bg-glass">
          <h2 className="text-xl font-bold text-green-700 mb-2">Form Jejak Hijau</h2>
          {nama && (
            <p className="text-sm text-red-600 mb-4">
              👤 Login sebagai: <strong>{nama}</strong>
            </p>
          )}
          <JejakForm />
        </div>
      </div>
    </MainLayout>
  );
}
