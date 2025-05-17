import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const seedAgenda = [
  {
    judul: "Penanaman Pohon Bersama",
    tanggal: "2025-06-05",
    deskripsi: "Kegiatan menanam 100 bibit pohon di area sekolah dalam rangka Hari Lingkungan Hidup Sedunia."
  },
  
  
];

export default function Agenda() {
  const [agendaList, setAgendaList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");
  const [form, setForm] = useState({ tanggal: "", judul: "", deskripsi: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAgenda = async () => {
      const querySnapshot = await getDocs(collection(db, "agenda"));
      const agendaData = querySnapshot.docs.map((doc) => doc.data());
      if (agendaData.length === 0) {
        for (const item of seedAgenda) {
          await addDoc(collection(db, "agenda"), item);
        }
        setAgendaList(seedAgenda);
      } else {
        setAgendaList(agendaData);
      }
    };
    fetchAgenda();
    const login = JSON.parse(localStorage.getItem("loginUser"));
    setUser(login);
  }, []);

  useEffect(() => {
    let data = [...agendaList];
    if (bulan) data = data.filter((item) => new Date(item.tanggal).getMonth() + 1 === parseInt(bulan));
    if (tahun) data = data.filter((item) => new Date(item.tanggal).getFullYear() === parseInt(tahun));
    setFiltered(data);
  }, [bulan, tahun, agendaList]);

  const semuaTahun = [...new Set(agendaList.map((a) => new Date(a.tanggal).getFullYear()))];

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const agendaRef = collection(db, "agenda");
    await addDoc(agendaRef, form);
    setForm({ tanggal: "", judul: "", deskripsi: "" });
    setEditIndex(null);
  };

  const handleEdit = (i) => {
    setForm(agendaList[i]);
    setEditIndex(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (i) => {
    if (confirm("Yakin ingin menghapus agenda ini?")) {
      const updated = agendaList.filter((_, index) => index !== i);
      setAgendaList(updated);
    }
  };

  const formatTanggal = (tgl) => new Date(tgl).toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const getBulanTahunSekarang = () => {
    const now = new Date();
    return `${now.toLocaleString("id-ID", { month: "long" })} ${now.getFullYear()}`;
  };

  const renderKalender = () => {
    const highlightDates = agendaList.map((a) => new Date(a.tanggal).getDate());
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    return (
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-6">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isAgenda = highlightDates.includes(day);
          return (
            <div key={i} className={`p-2 rounded-md ${isAgenda ? "bg-emerald-400 text-white font-semibold shadow" : "bg-gray-100"}`}>
              {day}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
          📅 Agenda Kegiatan Lingkungan dan Budaya
        </h2>

        {/* Kalender */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-green-600 mb-3 text-center">
            🗓️ Kalender {getBulanTahunSekarang()}
          </h3>
          {renderKalender()}
        </div>

        {/* Form Agenda */}
        {user?.role === "admin" && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="judul" value={form.judul} onChange={handleFormChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Judul Kegiatan" required />
              <input type="date" name="tanggal" value={form.tanggal} onChange={handleFormChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required />
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleFormChange}
                className="md:col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Deskripsi Singkat" rows={3} required />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              {editIndex !== null ? "💾 Simpan Perubahan" : "➕ Tambah Agenda"}
            </button>
          </form>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-6 justify-start">
          <select onChange={(e) => setBulan(e.target.value)} value={bulan}
            className="p-2 rounded-lg border bg-white shadow-sm hover:ring-2 hover:ring-green-300">
            <option value="">🌙 Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>
            ))}
          </select>
          <select onChange={(e) => setTahun(e.target.value)} value={tahun}
            className="p-2 rounded-lg border bg-white shadow-sm hover:ring-2 hover:ring-green-300">
            <option value="">📅 Semua Tahun</option>
            {semuaTahun.map((th) => (
              <option key={th} value={th}>{th}</option>
            ))}
          </select>
        </div>

        {/* Agenda Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((agenda, i) => (
              <div key={i} className="bg-white border rounded-xl p-4 shadow-md hover:shadow-lg transition">
                <p className="text-xs text-gray-400">{formatTanggal(agenda.tanggal)}</p>
                <h3 className="text-lg font-semibold text-emerald-700 mt-1 mb-2">{agenda.judul}</h3>
                <p className="text-sm text-gray-600">{agenda.deskripsi}</p>
                {user?.role === "admin" && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => handleEdit(i)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                    <button onClick={() => handleDelete(i)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Hapus</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full">Tidak ada agenda untuk filter yang dipilih.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}