import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Galeri() {
  const [media, setMedia] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    deskripsi: "",
    file: null,
    tanggal: new Date().toISOString().slice(0, 10),
    poin: 5,
  });
  const [totalPoin, setTotalPoin] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "galeriMedia"));
      const docs = snapshot.docs.map(doc => doc.data());
      setMedia(docs);
      const total = docs.reduce((sum, item) => sum + (item.poin || 0), 0);
      setTotalPoin(total);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) return;

    const newItem = { ...form };
    try {
      await addDoc(collection(db, "galeriMedia"), newItem);
      setMedia(prev => [...prev, newItem]);
      setTotalPoin(prev => prev + form.poin);
      setForm({
        nama: "",
        kelas: "",
        deskripsi: "",
        file: null,
        tanggal: new Date().toISOString().slice(0, 10),
        poin: 5,
      });
    } catch (err) {
      console.error("Gagal menyimpan ke Firestore:", err);
    }
  };

  return (
    <MainLayout>
      <div className="bg-glass p-4 md:p-6">
        <h2 className="text-xl font-semibold text-green-600 mb-4">Dokumentasi Lingkungan & Budaya</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 mb-6">
          <input
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Nama Siswa"
            className="border p-2 rounded"
            required
          />
          <input
            name="kelas"
            value={form.kelas}
            onChange={handleChange}
            placeholder="Kelas"
            className="border p-2 rounded"
            required
          />
          <input
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            placeholder="Deskripsi / Judul Dokumentasi"
            className="border p-2 rounded"
            required
          />
          
        </form>

        <p className="text-sm text-green-700 font-semibold mb-6">
          Total Poin Dokumentasi: <span className="text-green-900">{totalPoin}</span>
        </p>

        {media.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {media.map((item, i) => (
              <div key={i} className="border rounded shadow p-2 bg-white">
                <p className="text-sm font-semibold text-pink-700">{item.deskripsi}</p>
                <p className="text-xs text-gray-500">📅 {item.tanggal} | ⭐ {item.poin} poin</p>
                <p className="text-xs text-gray-500">👤 {item.nama} ({item.kelas})</p>
                {item.file?.startsWith("http") || item.file?.startsWith("data:") ? (
                  item.file.includes("video") ? (
                    <video controls className="w-full rounded mt-2">
                      <source src={item.file} />
                    </video>
                  ) : (
                    <img src={item.file} alt="galeri" className="w-full h-48 object-cover rounded mt-2" />
                  )
                ) : (
                  <p className="text-xs text-red-400 mt-2">Media tidak tersedia</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-blue-500">Belum ada dokumentasi yang diunggah.</p>
        )}
      </div>
    </MainLayout>
  );
}
