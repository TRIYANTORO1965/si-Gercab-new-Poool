"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ChevronDown } from "lucide-react";

const aksiData = {
  "Pengurangan Sampah": [
    { aksi: "Membawa botol minum sendiri ke sekolah setiap hari", poin: 5 },
    { aksi: "Tidak menggunakan sedotan plastik di kantin sekolah", poin: 3 },
    { aksi: "Membuang sampah pada tempat yang sesuai", poin: 4 },
    { aksi: "Membawa kotak makan sendiri dari rumah", poin: 4 },
    { aksi: "Mengurangi penggunaan tisu di kelas", poin: 2 },
    { aksi: "Ikut serta dalam kegiatan Jumat Bersih", poin: 7 },
    { aksi: "Membuat kerajinan dari barang bekas", poin: 6 },
  ],
  "Penghematan Energi": [
    { aksi: "Mematikan lampu kelas saat istirahat", poin: 3 },
    { aksi: "Mematikan komputer setelah digunakan", poin: 3 },
    { aksi: "Menggunakan kipas angin seperlunya", poin: 2 },
    { aksi: "Membuka jendela kelas untuk ventilasi", poin: 2 },
    { aksi: "Menggunakan tangga daripada lift", poin: 4 },
  ],
  "Penghematan Air": [
    { aksi: "Mematikan keran air setelah digunakan", poin: 3 },
    { aksi: "Tidak membuang-buang air saat mencuci tangan", poin: 2 },
    { aksi: "Menyiram tanaman dengan air bekas", poin: 4 },
  ],
  "Daur Ulang": [
    { aksi: "Mengumpulkan kertas bekas", poin: 5 },
    { aksi: "Mengumpulkan botol plastik", poin: 5 },
    { aksi: "Membuat kompos dari sampah daun", poin: 7 },
    { aksi: "Menggunakan kertas bekas untuk coret-coretan", poin: 3 },
  ],
  "Penanaman dan Perawatan": [
    { aksi: "Merawat tanaman di pot kelas", poin: 4 },
    { aksi: "Menanam tanaman di kebun sekolah", poin: 8 },
    { aksi: "Membuat poster tentang pentingnya lingkungan hijau", poin: 6 },
    { aksi: "Tidak merusak tanaman di sekolah", poin: 2 },
  ],
  "Edukasi dan Kampanye": [
    { aksi: "Membuat slogan atau yel-yel lingkungan", poin: 5 },
    { aksi: "Presentasi isu lingkungan di kelas", poin: 7 },
    { aksi: "Mading kegiatan peduli lingkungan", poin: 6 },
    { aksi: "Mengajak teman untuk aksi hijau", poin: 4 },
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
    const updated = [...data, newData];
    setData(updated);

    try {
      await addDoc(collection(db, "jejakHijau"), newData);
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    setForm({
      nama: "",
      kelas: "",
      kategori: "",
      aksi: "",
      lokasi: "",
      tanggal: "",
      poin: 0,
    });
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

  const chartMap = (key) => {
    const map = {};
    data.forEach((d) => {
      map[d[key]] = (map[d[key]] || 0) + d.poin;
    });
    return {
      labels: Object.keys(map),
      datasets: [
        {
          label: `Poin per ${key}`,
          data: Object.values(map),
          backgroundColor: "rgba(34,197,94,0.6)",
        },
      ],
    };
  };

  const totalPoin = data.reduce((t, d) => t + (d.poin || 0), 0);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-3xl mx-auto animate-fade-in">
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
        <input name="poin" type="number" value={form.poin} readOnly placeholder="Poin" className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg" />
        <button type="submit" className="col-span-1 sm:col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition w-full">Simpan Jejak</button>
      </form>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
        <button onClick={exportExcel} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition">Export ke Excel</button>
        <button onClick={exportPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">Export ke PDF</button>
      </div>

      <p className="text-center text-sm mt-4 text-gray-700">
        Total Poin: <strong className="text-green-700">{totalPoin}</strong>
      </p>

      {data.length > 0 && (
        <div className="mt-10 space-y-10">
          <div>
            <h3 className="text-lg font-bold text-blue-600 mb-3 text-center">Grafik Poin per Siswa</h3>
            <Bar data={chartMap("nama")} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-600 mb-3 text-center">Grafik Poin per Kategori</h3>
            <Bar data={chartMap("kategori")} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-600 mb-3 text-center">Grafik Poin per Aksi</h3>
            <Bar data={chartMap("aksi")} />
          </div>
        </div>
      )}
    </div>
  );
}
