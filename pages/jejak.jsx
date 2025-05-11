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
        <div className="w-full max-w-2xl sm:max-w-xl xs:max-w-sm mx-auto bg-glass rounded-xl p-6 shadow-soft animate-fade-in">
          <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
            Form Jejak Hijau
          </h2>

          <JejakForm />
        </div>
      </div>
    </MainLayout>
  );
}
