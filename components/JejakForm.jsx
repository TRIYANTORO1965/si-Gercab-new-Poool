"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ChevronDown } from "lucide-react";
import { CheckCircle, AlertCircle } from "lucide-react";

const aksiData = {
  "📦 Pengelolaan Sampah": [
    { aksi: "🔄 Pengumpulan sampah plastik dan daur ulang", poin: 5 },
    { aksi: "🛍️ Penggunaan kantong belanja ramah lingkungan", poin: 4 },
    { aksi: "📢 Penyuluhan tentang pemilahan sampah", poin: 6 },
    { aksi: "🏦 Program bank sampah sekolah", poin: 7 },
    { aksi: "🚮 Kampanye penggunaan wadah daur ulang", poin: 4 },
  ],
  "🌱 Pelestarian Alam dan Tanaman": [
    { aksi: "🌳 Penanaman pohon atau tanaman hias di sekitar sekolah", poin: 6 },
    { aksi: "🌿 Pengelolaan kebun sekolah", poin: 7 },
    { aksi: "🌳 Program penghijauan sekolah dan lingkungan sekitar", poin: 8 },
    { aksi: "📢 Penyuluhan tentang pentingnya tanaman untuk ekosistem", poin: 5 },
  ],
  "💡 Penghematan Energi dan Air": [
    { aksi: "🔌 Kampanye penghematan penggunaan energi listrik", poin: 5 },
    { aksi: "💡 Penggunaan alat hemat energi", poin: 4 },
    { aksi: "🚿 Penggunaan air secara bijak", poin: 5 },
    { aksi: "♻️ Program 'zero waste' untuk mengurangi limbah listrik", poin: 6 },
  ],
  "📚 Pendidikan Lingkungan Hidup": [
    { aksi: "🎤 Mengadakan seminar atau diskusi tentang pelestarian lingkungan", poin: 6 },
    { aksi: "📰 Membuat mading bertema lingkungan hidup", poin: 5 },
    { aksi: "📘 Program literasi lingkungan", poin: 6 },
    { aksi: "🧪 Proyek pembelajaran tentang ekosistem dan konservasi", poin: 7 },
  ],
  "🌿 Penggunaan Bahan Ramah Lingkungan": [
    { aksi: "🚫 Kampanye pengurangan plastik sekali pakai", poin: 5 },
    { aksi: "📄 Penerapan daur ulang kertas di sekolah", poin: 4 },
    { aksi: "🧴 Penggunaan produk ramah lingkungan", poin: 5 },
  ],
  "💧 Pengelolaan Sumber Daya Alam": [
    { aksi: "💦 Pengelolaan air hujan untuk kebutuhan sekolah", poin: 6 },
    { aksi: "🌞 Penggunaan sumber daya alam terbarukan", poin: 6 },
    { aksi: "🔋 Edukasi energi terbarukan (tenaga surya)", poin: 7 },
  ],
  "🧹 Kebersihan Lingkungan": [
    { aksi: "🧼 Gotong royong membersihkan lingkungan sekolah", poin: 5 },
    { aksi: "🗑️ Pembuatan tempat sampah terpisah", poin: 4 },
    { aksi: "🚰 Aksi membersihkan sungai/saluran air", poin: 7 },
  ],
  "🦋 Kampanye Keberagaman Hayati": [
    { aksi: "📢 Penyuluhan pentingnya keberagaman hayati", poin: 5 },
    { aksi: "🌼 Pengenalan flora dan fauna lokal", poin: 6 },
  ],
  "🌫️ Pengurangan Polusi Udara dan Suara": [
    { aksi: "🚲 Kampanye pengurangan kendaraan bermotor", poin: 5 },
    { aksi: "🧠 Edukasi dampak polusi udara", poin: 5 },
  ],
  "📣 Edukasi dan Kampanye Sosial": [
    { aksi: "🚶 Kampanye transportasi umum atau berjalan kaki", poin: 4 },
    { aksi: "🎨 Pembuatan poster/video kampanye lingkungan", poin: 5 },
  ],
};


export default function JejakForm() {
  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    kategori: "",
    aksi: "",
    lokasi: "",
    tanggal: "",
    poin: 0,
  });
  const [data, setData] = useState([]);
  const [lastPoin, setLastPoin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "jejakHijau"));
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      setData(fetchedData);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "kategori") {
      setForm((prev) => ({ ...prev, kategori: value, aksi: "", poin: 0 }));
    } else if (name === "aksi") {
      const aksiDipilih = aksiData[form.kategori]?.find((a) => a.aksi === value);
      setForm((prev) => ({ ...prev, aksi: value, poin: aksiDipilih?.poin || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newData = { ...form };
    try {
      await addDoc(collection(db, "jejakHijau"), newData);
      alert("Data berhasil disimpan!");
      setData((prev) => [...prev, newData]);
      setLastPoin(newData.poin);
      setForm({
        nama: "",
        kelas: "",
        kategori: "",
        aksi: "",
        lokasi: "",
        tanggal: "",
        poin: 0,
      });
    } catch (error) {
      alert("Gagal menyimpan data. Coba lagi.");
      console.error("Error adding document: ", error);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jejak Hijau");
    XLSX.writeFile(wb, "jejak_hijau.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Jejak Hijau", 14, 16);
    autoTable(doc, {
      head: [["Nama", "Kelas", "Kategori", "Aksi", "Lokasi", "Tanggal", "Poin"]],
      body: data.map((d) => [
        d.nama,
        d.kelas,
        d.kategori,
        d.aksi,
        d.lokasi,
        d.tanggal,
        d.poin || "",
      ]),
    });
    doc.save("jejak_hijau.pdf");
  };

  const totalPoin = data.reduce((t, d) => t + (d.poin || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md">
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input name="kelas" value={form.kelas} onChange={handleChange} placeholder="Kelas" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <div className="relative">
            <select name="kategori" value={form.kategori} onChange={handleChange} required className="appearance-none w-full px-4 py-2 border border-green-300 bg-green-50 text-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Pilih Kategori</option>
              {Object.keys(aksiData).map((kat) => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" />
          </div>
          {form.kategori && (
            <div className="relative">
              <select name="aksi" value={form.aksi} onChange={handleChange} required className="appearance-none w-full px-4 py-2 border border-blue-300 bg-blue-50 text-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Pilih Aksi</option>
                {aksiData[form.kategori].map((a) => (
                  <option key={a.aksi} value={a.aksi}>{a.aksi}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
            </div>
          )}
          <input name="lokasi" value={form.lokasi} onChange={handleChange} placeholder="Lokasi" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <input name="tanggal" type="date" value={form.tanggal} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
          <button type="submit" className="col-span-1 sm:col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition w-full">Simpan Jejak</button>
        </form>

        {lastPoin !== null && (
          <p className="text-center text-green-700 mt-4">👍 Poin berhasil dikirim: <strong>{lastPoin}</strong></p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <button onClick={exportExcel} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition">Export ke Excel</button>
          <button onClick={exportPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">Export ke PDF</button>
        </div>

        <p className="text-center text-sm mt-4 text-gray-700">
          Total Poin: <strong className="text-green-700">{totalPoin}</strong>
        </p>
      </div>
    </div>
  );
}
