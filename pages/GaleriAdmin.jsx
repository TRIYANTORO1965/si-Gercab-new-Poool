import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../lib/useAuth";

export default function GaleriAdmin() {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    deskripsi: "",
    tanggal: new Date().toISOString().slice(0, 10),
    poin: 5,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "galeriMedia"));
    const docs = snapshot.docs.map(doc => doc.data());
    setMedia(docs);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "galeriMedia"), form);
      alert("Data dokumentasi berhasil disimpan!");
      setForm({
        nama: "",
        kelas: "",
        deskripsi: "",
        tanggal: new Date().toISOString().slice(0, 10),
        poin: 5,
      });
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
    setLoading(false);
  };

  if (!user || user.role !== "admin") {
    return (
      <MainLayout>
        <div className="p-6 text-center text-red-600 font-semibold">
          🚫 Halaman ini hanya untuk admin
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-bold text-green-700 mb-4">
          📝 Tambah Dokumentasi Galeri
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Nama</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Kelas</label>
            <input
              type="text"
              name="kelas"
              value={form.kelas}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Deskripsi</label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Poin</label>
            <input
              type="number"
              name="poin"
              value={form.poin}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Menyimpan..." : "Simpan Dokumentasi"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
