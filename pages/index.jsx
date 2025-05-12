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
        <div className="text-center text-gray-500 py-20">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Selamat Datang */}
      <section className="text-center py-6 px-4">
        <h1 className="text-3xl font-bold text-green-700">
          Selamat Datang, {nama}!
        </h1>
        <p className="mt-2 text-gray-600 max-w-xl mx-auto">
          Ini adalah beranda <strong>Si Gercab</strong> — Sistem Informasi Gerakan Cinta Budaya & Lingkungan.
        </p>
      </section>

      {/* Ringkasan Kegiatan */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-8">
        <div className="bg-green-100 p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-green-800">🪴 125</h2>
          <p className="text-sm mt-1 text-gray-700">Aksi Jejak Hijau</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-yellow-700">🎨 85</h2>
          <p className="text-sm mt-1 text-gray-700">Kegiatan Budaya</p>
        </div>
        <div className="bg-blue-100 p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-700">📸 450+</h2>
          <p className="text-sm mt-1 text-gray-700">Foto Dokumentasi</p>
        </div>
      </section>

      
      {/* Slogan & Visi */}
      <section className="bg-white border-t px-6 py-6 text-center text-sm text-gray-600 space-y-2">
        <p>"Anak Kayen, cinta bumi dan bangga tradisi!"</p>
        <p>"Dengan budaya di hati dan bumi di langkah, kita berjalan ke masa depan dengan harapan."</p>
        <p>"Jejak hijau dan jejak budaya: dua warisan mulia yang hidup di SMPN 2 Kayen."</p>
        <p>"Kami tanamkan nilai, rawat alam, dan hidupkan budaya — bersama di sekolah tercinta."</p>
        <p><strong>“Menanam nilai, merawat bumi, melestarikan budaya — bersama Si Gercab.”</strong></p>
      </section>
    </MainLayout>
  );
}
