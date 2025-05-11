"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "chart.js/auto";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const aksiBudaya = {
  "Apresiasi dan Ekspresi Seni Budaya": [
    { aksi: "Pentas Seni Rutin", poin: 5 },
    { aksi: "Ekstrakurikuler Seni Aktif", poin: 4 },
    { aksi: "Workshop dan Kelas Seni", poin: 6 },
    { aksi: "Pameran Karya Seni Siswa", poin: 5 },
    { aksi: "Festival Seni dan Budaya Sekolah", poin: 7 },
  ],
  "Pelestarian dan Pemahaman Warisan Budaya": [
    { aksi: "Klub Sejarah dan Budaya", poin: 4 },
    { aksi: "Kunjungan ke Situs Budaya", poin: 6 },
    { aksi: "Narasumber Budaya", poin: 5 },
    { aksi: "Proyek Penelitian Budaya Lokal", poin: 7 },
    { aksi: "Dokumentasi Budaya", poin: 5 },
  ],
};

export default function BudayaForm() {
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
  const [totalPoin, setTotalPoin] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "budayaHijau"));
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      setData(fetchedData);
      setTotalPoin(fetchedData.reduce((sum, d) => sum + d.poin, 0));
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "kategori") {
      setForm({ ...form, kategori: value, aksi: "", poin: 0 });
    } else if (name === "aksi") {
      const aksiDipilih = aksiBudaya[form.kategori]?.find((a) => a.aksi === value);
      setForm({ ...form, aksi: value, poin: aksiDipilih?.poin || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "budayaHijau"), form);
    const updated = [...data, form];
    setData(updated);
    setTotalPoin(totalPoin + form.poin);
    setForm({ nama: "", kelas: "", kategori: "", aksi: "", lokasi: "", tanggal: "", poin: 0 });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Budaya Hijau");
    XLSX.writeFile(wb, "budaya_hijau.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Budaya Hijau", 14, 16);
    autoTable(doc, {
      head: [["Nama", "Kelas", "Kategori", "Aksi", "Lokasi", "Tanggal", "Poin"]],
      body: data.map((d) => [d.nama, d.kelas, d.kategori, d.aksi, d.lokasi, d.tanggal, d.poin]),
    });
    doc.save("budaya_hijau.pdf");
  };

  const chart = {
    labels: data.map((d) => d.nama),
    datasets: [
      {
        label: "Poin Budaya per Siswa",
        data: data.map((d) => d.poin),
        backgroundColor: "rgba(244,114,182,0.6)",
      },
    ],
  };

  return (
    <div className="bg-white px-4 py-6 sm:px-6 lg:px-8 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama Siswa" className="border rounded px-3 py-2 w-full" />
        <input name="kelas" value={form.kelas} onChange={handleChange} placeholder="Kelas" className="border rounded px-3 py-2 w-full" />
        <select name="kategori" value={form.kategori} onChange={handleChange} className="border rounded px-3 py-2 w-full">
          <option value="">Pilih Kategori Budaya</option>
          {Object.keys(aksiBudaya).map((kat) => (
            <option key={kat} value={kat}>{kat}</option>
          ))}
        </select>
        {form.kategori && (
          <select name="aksi" value={form.aksi} onChange={handleChange} className="border rounded px-3 py-2 w-full">
            <option value="">Pilih Aksi Budaya</option>
            {aksiBudaya[form.kategori].map((a) => (
              <option key={a.aksi} value={a.aksi}>{a.aksi}</option>
            ))}
          </select>
        )}
        <input name="lokasi" value={form.lokasi} onChange={handleChange} placeholder="Lokasi" className="border rounded px-3 py-2 w-full" />
        <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        <input type="number" readOnly value={form.poin} className="border rounded bg-gray-100 px-3 py-2 w-full" placeholder="Poin Otomatis" />
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-pink-700 transition w-full md:col-span-2">
          Simpan Budaya
        </button>
      </form>

      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        <button onClick={exportExcel} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          Export Excel
        </button>
        <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Export PDF
        </button>
      </div>

      <p className="mt-4 text-sm text-center">
        Total Poin Budaya: <span className="font-bold text-pink-700">{totalPoin}</span>
      </p>

      {data.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-lg font-semibold text-pink-700 mb-2 text-center">Grafik Poin Budaya</h3>
          <Bar data={chart} />
        </div>
      )}
    </div>
  );
}
