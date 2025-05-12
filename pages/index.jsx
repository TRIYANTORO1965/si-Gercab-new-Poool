import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role");
      const userNama = localStorage.getItem("nama");

      if (!storedRole || !userNama) {
        router.push("/login");
      } else {
        setRole(storedRole);
        setNama(userNama);
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          Selamat datang
        </h1>
        <p className="mt-2 text-gray-600">
          Ini adalah beranda Si Gercab — Sistem Informasi Gerakan Cinta Budaya & Lingkungan
        </p>
      </div>

      {/* Ringkasan kegiatan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-4">
        <div className="bg-green-100 p-4 rounded-xl text-center shadow">
          <h2 className="text-xl font-bold">🪴 125</h2>
          <p className="text-sm">Aksi Jejak Hijau</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center shadow">
          <h2 className="text-xl font-bold">🎨 85</h2>
          <p className="text-sm">Kegiatan Budaya</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl text-center shadow">
          <h2 className="text-xl font-bold">📸 450+</h2>
          <p className="text-sm">Foto Dokumentasi</p>
        </div>
      </div>

      {/* Mini Galeri */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-semibold mb-2">Dokumentasi Kegiatan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <Image src="/galeri1.jpg" alt="kegiatan 1" width={300} height={200} className="rounded-lg object-cover" />
          <Image src="/galeri2.jpg" alt="kegiatan 2" width={300} height={200} className="rounded-lg object-cover" />
          <Image src="/galeri3.jpg" alt="kegiatan 3" width={300} height={200} className="rounded-lg object-cover" />
          <Image src="/galeri4.jpg" alt="kegiatan 4" width={300} height={200} className="rounded-lg object-cover" />
        </div>
      </div>

      {/* Slogan atau Visi Misi */}
      <div className="bg-white px-6 py-4 border-t text-center text-sm text-gray-500">
      "Anak Kayen, cinta bumi dan bangga tradisi!"

"Dengan budaya di hati dan bumi di langkah, kita berjalan ke masa depan dengan harapan."

"Jejak hijau dan jejak budaya: dua warisan mulia yang hidup di SMPN 2 Kayen."

"Kami tanamkan nilai, rawat alam, dan hidupkan budaya — bersama di sekolah tercinta."
        “Menanam nilai, merawat bumi, melestarikan budaya — bersama Si Gercab.”
      </div>
    </MainLayout>
  );
}
