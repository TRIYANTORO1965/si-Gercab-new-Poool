import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Import ikon dari react-icons
import { GiTreeGrowth, GiGreekTemple } from "react-icons/gi";
import { MdReportProblem } from "react-icons/md";

export default function Home() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jejakCount, setJejakCount] = useState(0);
  const [budayaCount, setBudayaCount] = useState(0);
  const [laporCount, setLaporCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== "undefined") {
        const storedRole = localStorage.getItem("role");
        const userNama = localStorage.getItem("nama");

        if (!storedRole || !userNama) {
          router.push("/login");
        } else {
          setRole(storedRole);
          setNama(userNama);

          const jejakSnap = await getDocs(collection(db, "jejakHijau"));
          const budayaSnap = await getDocs(collection(db, "budaya"));
          const laporSnap = await getDocs(collection(db, "laporanLingkungan"));

          setJejakCount(jejakSnap.size);
          setBudayaCount(budayaSnap.size);
          setLaporCount(laporSnap.size);
        }

        setIsLoading(false);
      }
    };

    fetchData();
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
        <h1 className="text-3xl font-bold text-green-700">Selamat Datang</h1>
        <p className="mt-2 text-gray-600 max-w-xl mx-auto">
          Ini adalah beranda <strong>Si Gercab</strong> — Sistem Informasi Gerakan Cinta Budaya & Lingkungan. Silahkan pilih menu di atas untuk mengisi kegiatan
        </p>
      </section>

      {/* Ringkasan Kegiatan */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-8">
        <div className="bg-green-100 p-6 rounded-xl shadow text-center">
          <GiTreeGrowth className="text-green-700 mx-auto mb-3" size={64} />
          <h2 className="text-2xl font-bold text-green-800">{jejakCount}</h2>
          <p className="text-sm mt-1 text-gray-700">Aksi Jejak Hijau</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-xl shadow text-center">
          <GiGreekTemple className="text-yellow-700 mx-auto mb-3" size={64} />
          <h2 className="text-2xl font-bold text-yellow-700">{budayaCount}</h2>
          <p className="text-sm mt-1 text-gray-700">Kegiatan Budaya</p>
        </div>
        <div className="bg-blue-100 p-6 rounded-xl shadow text-center">
          <MdReportProblem className="text-blue-700 mx-auto mb-3" size={64} />
          <h2 className="text-2xl font-bold text-blue-700">{laporCount}</h2>
          <p className="text-sm mt-1 text-gray-700">Laporan Lingkungan</p>
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

      {/* Tentang Aplikasi */}
      <section className="bg-blue-900 px-6 py-6 text-justify text-white max-w-3xl mx-auto leading-relaxed rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Tentang Aplikasi Si Gercab</h2>
        <p>
          <strong>Si Gercab</strong> adalah platform digital yang dirancang untuk mendukung kegiatan cinta lingkungan dan budaya di lingkungan sekolah.
          Aplikasi ini memudahkan siswa dan guru untuk melaporkan aksi lingkungan, mendokumentasikan kegiatan budaya, serta mengelola data dengan efisien.
        </p>
        <p className="mt-2">
          Dengan sistem ini, setiap kontribusi kecil—seperti menanam pohon, menjaga kebersihan, hingga mengenalkan tradisi lokal—akan terdokumentasi dan menjadi bagian dari gerakan besar menuju sekolah yang hijau dan berbudaya.
        </p>
      </section>
    </MainLayout>
  );
}
