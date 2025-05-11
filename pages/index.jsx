import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import JejakForm from "@/components/JejakForm";
import MainLayout from "@/components/MainLayout";

export default function Home() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Pastikan ini hanya dijalankan di sisi client
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role");
      const userNama = localStorage.getItem("nama");

      // Jika tidak ada role atau nama, arahkan ke halaman login
      if (!storedRole || !userNama) {
        router.push("/login");
      } else {
        setRole(storedRole);
        setNama(userNama);
      }
    }
  }, [router]);

  return (
    <MainLayout>
      {/* Menampilkan pesan selamat datang atau status pengguna */}
      <div className="mb-4 text-center">
        {role && nama ? (
          <h1 className="text-xl font-semibold">
            Selamat datang, {nama} ({role})
          </h1>
        ) : (
          <h1 className="text-xl font-semibold">Loading...</h1>
        )}
      </div>

      {/* Form Jejak hanya akan muncul jika role sudah ada */}
      {role && <JejakForm />}
    </MainLayout>
  );
}
