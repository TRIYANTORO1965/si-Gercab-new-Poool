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
      <div className="">
        <div className="">
          <h2 className="text-2xl font-bold text-pink-700 mb-6 text-center">
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
