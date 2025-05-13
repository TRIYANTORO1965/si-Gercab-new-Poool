import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function Galeri() {
  const [media, setMedia] = useState([]);
  const [form, setForm] = useState({
    deskripsi: "",
    tanggal: "",
    lokasi: "",
    kategori: "",
  });
  const [user, setUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterKategori, setFilterKategori] = useState("Semua");

  const kategoriIkon = {
    Lingkungan: "🌿",
    Budaya: "🎭",
    Religius: "🕌",
    Nasionalisme: "🇮🇩",
    Literasi: "📚",
    GotongRoyong: "🤝",
    Kedisiplinan: "⏰",
    SopanSantun: "🙏",
    Seni: "🎨",
    Digital: "💻",
    Semua: "🗂️",
  };

  useEffect(() => {
    const login = JSON.parse(localStorage.getItem("loginUser"));
    setUser(login);
  }, []);

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "galeriMedia"));
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMedia(docs);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) {
      const ref = doc(db, "galeriMedia", editId);
      await updateDoc(ref, form);
      setIsEdit(false);
      setEditId(null);
    } else {
      await addDoc(collection(db, "galeriMedia"), form);
    }

    setForm({
      deskripsi: "",
      tanggal: "",
      lokasi: "",
      kategori: "",
    });
    fetchData();
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item.id);
    setForm({
      deskripsi: item.deskripsi,
      tanggal: item.tanggal,
      lokasi: item.lokasi,
      kategori: item.kategori,
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "galeriMedia", id));
    fetchData();
  };

  const filtered = filterKategori === "Semua"
    ? media
    : media.filter((m) => m.kategori === filterKategori);

  return (
    <MainLayout>
      <div className="bg-white p-4 md:p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
          🌿 Galeri Cinta Lingkungan & Budaya
        </h2>

        {/* Filter Kategori */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {Object.keys(kategoriIkon).map((kategori) => (
            <button
              key={kategori}
              onClick={() => setFilterKategori(kategori)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                filterKategori === kategori
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-600 border-green-600"
              }`}
            >
              {kategoriIkon[kategori]} {kategori}
            </button>
          ))}
        </div>

        {/* List Dokumentasi */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item, i) => {
              const ikon = kategoriIkon[item.kategori] || "🗂️";
              return (
                <div
                  key={i}
                  className="border border-green-200 rounded-xl bg-green-50 p-4 hover:bg-green-100 transition relative"
                >
                  <div className="text-lg text-green-700 font-semibold mb-1">
                    {ikon} {item.kategori}
                  </div>
                  <p className="text-green-900 font-medium">{item.deskripsi}</p>
                  <p className="text-sm text-gray-600 mt-1">📍 {item.lokasi}</p>
                  <p className="text-sm text-gray-500">📅 {item.tanggal}</p>

                  {user?.role === "admin" && (
                    <div className="absolute top-2 right-2 space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-blue-600 text-sm">
            Belum ada dokumentasi yang tersedia.
          </p>
        )}

        {/* Form Admin */}
        {user?.role === "admin" && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-green-50 p-4 rounded-lg mt-10 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-green-700">
              {isEdit ? "Edit Dokumentasi" : "Tambah Dokumentasi Baru (Admin)"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                className="p-3 border rounded"
                required
              />
              <input
                type="text"
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="Lokasi"
                className="p-3 border rounded"
                required
              />
              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                className="p-3 border rounded"
                required
              >
                <option value="">Pilih Kategori</option>
                {Object.keys(kategoriIkon).filter(k => k !== "Semua").map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategoriIkon[kategori]} {kategori}
                  </option>
                ))}
              </select>
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
              {isEdit ? "Simpan Perubahan" : "Simpan Dokumentasi"}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
