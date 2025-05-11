import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import BudayaForm from "@/components/BudayaForm";

export default function Budaya() {
  const [nama, setNama] = useState("");

  useEffect(() => {
    const storedNama = localStorage.getItem("nama");
    if (storedNama) setNama(storedNama);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-yellow-50 py-6 px-4">
        <div className="w-full max-w-xl mx-auto bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold text-green-700 mb-4">
            Form Budaya Sekolah
          </h2>
          <div className="overflow-x-auto">
            <BudayaForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
