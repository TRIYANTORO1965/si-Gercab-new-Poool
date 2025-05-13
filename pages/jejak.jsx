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
      <div className=" ">
        <div className=" ">
          <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">
            Form Jejak Hijau
          </h2>

          <JejakForm />
        </div>
      </div>
    </MainLayout>
  );
}
