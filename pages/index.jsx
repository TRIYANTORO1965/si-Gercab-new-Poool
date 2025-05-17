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

  // Data foto aksi untuk slider
  const aksiPhotos = [
    { src: "/aksi1.jpg", alt: "Aksi menanam pohon" },
    { src: "/aksi2.jpg", alt: "Kegiatan budaya tradisional" },
    { src: "/aksi3.jpg", alt: "Laporan kebersihan lingkungan" },
  ];

  const [currentPhoto, setCurrentPhoto] = useState(0);

  const prevSlide = () => {
    setCurrentPhoto(currentPhoto === 0 ? aksiPhotos.length - 1 : currentPhoto - 1);
  };

  const nextSlide = () => {
    setCurrentPhoto(currentPhoto === aksiPhotos.length - 1 ? 0 : currentPhoto + 1);
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhoto((prev) => (prev + 1) % aksiPhotos.length);
    }, 5000); // Ganti foto setiap 5 detik

    return () => clearInterval(interval);
  }, [aksiPhotos.length]);

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
      <section className="bg-green-100 px-6 py-4 rounded-xl shadow text-center mb-6">
        <h1 className="text-2xl font-bold text-green-800 drop-shadow-sm mb-2">🌿 Selamat Datang 🎉</h1>
        <p className="text-sm text-gray-700 max-w-3xl mx-auto">
          Ini adalah beranda <strong className="text-red-600">Si Gercab</strong> — <em>Sistem Informasi Gerakan Cinta Alam & Budaya</em>.<br />
          Silakan pilih menu di atas untuk melakukan aksi hebatmu hari ini!
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

      {/* Slider Foto Aksi */}
      <section className="max-w-4xl mx-auto px-6 py-4 mb-8">
        <h3
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
          className="text-lg font-semibold text-green-800 mb-4"
        >
          <div
            style={{
              display: "inline-block",
              paddingLeft: "100%",
              animation: "marquee 90s linear infinite",
            }}
          >
            “Melangkah Hijau, Menghidupkan Budaya” -- “Alam Terjaga, Budaya Terpelihara” -- “Bersama Menjaga Bumi dan Warisan” -- “Cinta Alam, Cinta Budaya, Cinta Kita Semua” -- “Aksi Nyata untuk Bumi dan Tradisi” -- “Hijaukan Langkah, Hidupkan Budaya” -- “Dari Alam Kita Belajar, Dari Budaya Kita Tumbuh” -- “Langkah Kecil untuk Warisan Besar” -- “Kita Jaga Bumi, Kita Lestarikan Budaya” -- “Gerakan Cinta Alam dan Budaya, Warisan untuk Generasi” 
          </div>
        </h3>
        <div className="relative">
          <img
            src={aksiPhotos[currentPhoto].src}
            alt={aksiPhotos[currentPhoto].alt}
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />

          {/* Tombol navigasi */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-green-700 text-white rounded-full p-2 hover:bg-green-900"
            aria-label="Previous Slide"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-green-700 text-white rounded-full p-2 hover:bg-green-900"
            aria-label="Next Slide"
          >
            ›
          </button>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center mt-3 space-x-2">
          {aksiPhotos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPhoto(idx)}
              className={`w-3 h-3 rounded-full ${
                idx === currentPhoto ? "bg-green-700" : "bg-green-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Style animasi marquee */}
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </section>

      {/* Slogan & Visi */}
      <section className="bg-white border-t px-6 py-4 text-center text-sm text-green-700 space-y-1">
        <p>"Anak Kayen, cinta bumi dan bangga tradisi!"</p>
        <p>"Dengan budaya di hati dan bumi di langkah, kita berjalan ke masa depan dengan harapan."</p>
        <p>"Jejak hijau dan jejak budaya: dua warisan mulia yang hidup di SMPN 2 Kayen."</p>
        <p>"Kami tanamkan nilai, rawat alam, dan hidupkan budaya — bersama di sekolah tercinta."</p>
        <p><strong>“Menanam nilai, merawat bumi, melestarikan budaya — bersama Si Gercab.”</strong></p>
      </section>

      {/* Tentang Aplikasi */}
      <section className="bg-blue-900 px-6 py-6 text-justify text-yellow-100 max-w-2xl mx-auto leading-relaxed rounded-xl shadow text-sm sm:text-base">
        <h2 className="text-xl font-semibold mb-2 text-yellow-200">Tentang Aplikasi <span className="text-red-400">Si Gercab</span></h2>
        <p>
          <strong className="text-red-400">Si Gercab</strong> adalah platform digital yang dirancang untuk mendukung kegiatan cinta lingkungan dan budaya di lingkungan sekolah.
          Aplikasi ini memudahkan siswa dan guru untuk melaporkan aksi lingkungan, mendokumentasikan kegiatan budaya, serta mengelola data dengan efisien.
        </p>
        <p className="mt-2">
          Dengan sistem ini, setiap kontribusi kecil—seperti menanam pohon, menjaga kebersihan, hingga mengenalkan tradisi lokal—akan terdokumentasi dan menjadi bagian dari gerakan besar menuju sekolah yang hijau dan berbudaya.
        </p>
      </section>
    </MainLayout>
  );
}
