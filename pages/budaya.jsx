import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import BudayaForm from "@/components/BudayaForm"; // Ganti sesuai dengan komponen form yang kamu buat

export default function Budaya() {
  const [nama, setNama] = useState("");
  useEffect(() => {
    const storedNama = localStorage.getItem("nama");
    if (storedNama) setNama(storedNama);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-yellow-50 py-6 px-4">
        <div className="max-w-4xl mx-auto bg-glass">
          <h2 className="text-xl font-bold text-green-700 mb-2">Form Budaya Sekolah</h2>
          
          <BudayaForm />
        </div>
      </div>
    </MainLayout>
  );
}
