import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function Galeri() {
  const [media, setMedia] = useState([]);
  const [totalPoin, setTotalPoin] = useState(0);
  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    deskripsi: "",
    tanggal: "",
    poin: "",
  });
  const [user, setUser] = useState(null);

  // Contoh dokumentasi jika Firestore kosong
  const contoh = [
    {
      nama: "Lestari",
      kelas: "7A",
      deskripsi: "Menanam pohon di taman sekolah untuk menjaga udara tetap bersih.",
      tanggal: "2025-05-10",
      poin: 10,
    },
    {
      nama: "Budi",
      kelas: "8B",
      deskripsi: "Menampilkan tari tradisional Jawa saat Hari Budaya Nasional.",
      tanggal: "2025-05-08",
      poin: 7,
    },
    {
      nama: "Sari",
      kelas: "9C",
      deskripsi: "Bersama teman-teman membersihkan sungai di sekitar sekolah.",
      tanggal: "2025-05-01",
      poin: 8,
    },
    {
      nama: "Ayu",
      kelas: "7C",
      deskripsi: "Membuat kerajinan tangan dari barang bekas plastik.",
      tanggal: "2025-04-25",
      poin: 6,
    },
  ];

  useEffect(() => {
    const login = JSON.parse(localStorage.getItem("loginUser"));
    setUser(login);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "galeriMedia"));
      const docs = snapshot.docs.map(doc => doc.data());
      const allData = docs.length > 0 ? docs : contoh; // fallback
      setMedia(allData);
      const total = allData.reduce((sum, item) => sum + (item.poin || 0), 0);
      setTotalPoin(total);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newData = { ...form, poin: parseInt(form.poin) };
    await addDoc(collection(db, "galeriMedia"), newData);

    setForm({ nama: "", kelas: "", deskripsi: "", tanggal: "", poin: "" });

    const snapshot = await getDocs(collection(db, "galeriMedia"));
    const docs = snapshot.docs.map((doc) => doc.data());
    setMedia(docs);
    const total = docs.reduce((sum, item) => sum + (item.poin || 0), 0);
    setTotalPoin(total);
  };

  return (
    <MainLayout>
      <div className="bg-white p-4 md:p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
          🌿 Galeri Cinta Lingkungan & Budaya
        </h2>

        <p className="text-center text-green-800 font-medium mb-8">
          Total Poin Dokumentasi: <span className="font-bold">{totalPoin}</span>
        </p>

        {media.length > 0 ? (
          <div className="space-y-4">
            {media.map((item, i) => (
              <div key={i} className="border border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition">
                <h3 className="text-lg font-semibold text-green-800">{item.deskripsi}</h3>
                <p className="text-sm text-gray-600 mt-1">👤 {item.nama} ({item.kelas})</p>
                <p className="text-sm text-gray-500">📅 {item.tanggal} | ⭐ {item.poin} poin</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-blue-600 text-sm">Belum ada dokumentasi yang tersedia.</p>
        )}

        {user?.role === "admin" && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-green-50 p-4 rounded-lg mt-10 shadow-sm">
            <h3 className="text-lg font-semibold text-green-700">Tambah Dokumentasi Baru (Admin)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama"
                className="p-3 border rounded"
                required
              />
              <input
                type="text"
                name="kelas"
                value={form.kelas}
                onChange={handleChange}
                placeholder="Kelas"
                className="p-3 border rounded"
                required
              />
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                className="p-3 border rounded"
                required
              />
              <input
                type="number"
                name="poin"
                value={form.poin}
                onChange={handleChange}
                placeholder="Poin"
                className="p-3 border rounded"
                required
              />
            </div>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsi kegiatan"
              rows={3}
              className="w-full p-3 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Simpan Dokumentasi
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
