import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SiswaPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const nama = localStorage.getItem("nama");
    const loginUser = JSON.parse(localStorage.getItem("loginUser"));

    if (!role || role !== "siswa") {
      router.replace("/");
    } else {
      setNama(nama || loginUser?.nama || "Siswa");
      setKelas(loginUser?.kelas || "Belum Diisi");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <div className="bg-white p-6 rounded shadow text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Selamat Datang, Siswa</h1>
        <p className="text-gray-700 mb-1">Halo <strong>{nama}</strong></p>
        <p className="text-gray-700 mb-4">Kelas: {kelas}</p>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
