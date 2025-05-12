import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../lib/useAuth"; // Pastikan user.role ada

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

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "galeriMedia"));
    const docs = snapshot.docs.map(doc => doc.data());
    setMedia(docs);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <h2 className="text-xl font-bold text-green-700 mb-4">📝 Tambah Dokumentasi Galeri</h2>
        <form onSubmit
