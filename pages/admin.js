import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AdminPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const nama = localStorage.getItem("nama");

    if (role !== "admin") {
      router.replace("/"); // Redirect ke homepage jika bukan admin
    } else {
      setAdminName(nama || "Admin");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-700">👨‍💼 Selamat Datang, Admin</h1>
        <p className="text-lg mb-2">Halo, <strong>{adminName}</strong></p>
        <p className="text-sm text-gray-600">Ini adalah dashboard admin. Silakan tambahkan menu fitur lainnya di sini.</p>
      </div>
    </div>
  );
}
