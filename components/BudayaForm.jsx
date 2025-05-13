"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "chart.js/auto";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { FaChevronDown } from "react-icons/fa";
import {
  FaLeaf, FaBook, FaHandsHelping, FaBible, FaFlag,
  FaMapMarkedAlt, FaLightbulb, FaUsers, FaGlobe, FaLaptop, FaUser,
  FaChalkboardTeacher, FaFileExport, FaSave, FaExclamationTriangle
} from "react-icons/fa";

const kategoriIkon = {
  "Budaya Religius": <FaBible className="inline-block mr-2 text-indigo-600" />, 
  "Budaya Nasionalisme & Kebangsaan": <FaFlag className="inline-block mr-2 text-red-600" />, 
  "Budaya Lokal/Tradisional": <FaMapMarkedAlt className="inline-block mr-2 text-orange-600" />, 
  "Budaya Literasi": <FaBook className="inline-block mr-2 text-yellow-600" />, 
  "Budaya Kedisiplinan": <FaLightbulb className="inline-block mr-2 text-blue-600" />, 
  "Budaya Kebersamaan & Gotong Royong": <FaHandsHelping className="inline-block mr-2 text-green-600" />, 
  "Budaya Ramah & Sopan Santun": <FaUsers className="inline-block mr-2 text-pink-600" />, 
  "Budaya Kreativitas & Ekspresi Seni": <FaLeaf className="inline-block mr-2 text-purple-600" />, 
  "Budaya Lingkungan (Hijau)": <FaGlobe className="inline-block mr-2 text-green-700" />, 
  "Budaya Digital Positif": <FaLaptop className="inline-block mr-2 text-gray-600" />,
};

const aksiBudaya = {
  "Budaya Religius": [
    { aksi: "Doa bersama sebelum dan sesudah pelajaran", poin: 2 },
    { aksi: "Peringatan hari besar keagamaan", poin: 3 },
    { aksi: "Kultum pagi / pesan moral saat upacara", poin: 2 },
    { aksi: "Membaca kitab suci", poin: 2 },
    { aksi: "Penghormatan antar umat beragama", poin: 3 },
  ],
  "Budaya Nasionalisme & Kebangsaan": [
    { aksi: "Upacara bendera setiap Senin", poin: 3 },
    { aksi: "Peringatan hari besar nasional", poin: 3 },
    { aksi: "Menyanyikan lagu wajib/nasional", poin: 2 },
    { aksi: "Pidato bertema kebangsaan", poin: 2 },
    { aksi: "Pemakaian atribut nasional", poin: 2 },
  ],
  "Budaya Lokal/Tradisional": [
    { aksi: "Penggunaan dan pelestarian bahasa daerah", poin: 2 },
    { aksi: "Tari tradisional / ekstrakurikuler", poin: 2 },
    { aksi: "Pertunjukan musik daerah", poin: 2 },
    { aksi: "Festival makanan tradisional", poin: 2 },
    { aksi: "Pameran kerajinan lokal", poin: 2 },
  ],
  "Budaya Literasi": [
    { aksi: "Program wajib baca 15 menit", poin: 2 },
    { aksi: "Kegiatan perpustakaan dan pojok baca", poin: 2 },
    { aksi: "Karya tulis ilmiah remaja", poin: 3 },
    { aksi: "Majalah dinding budaya", poin: 2 },
    { aksi: "Lomba menulis cerita rakyat", poin: 3 },
  ],
  "Budaya Kedisiplinan": [
    { aksi: "Hadir tepat waktu", poin: 2 },
    { aksi: "Seragam rapi sesuai aturan", poin: 2 },
    { aksi: "Mengikuti tata tertib sekolah", poin: 2 },
    { aksi: "Antri dengan tertib", poin: 2 },
    { aksi: "Tidak bolos atau terlambat", poin: 3 },
  ],
  "Budaya Kebersamaan & Gotong Royong": [
    { aksi: "Kerja bakti membersihkan lingkungan", poin: 2 },
    { aksi: "Kegiatan piket bersama", poin: 2 },
    { aksi: "Buka puasa / makan bersama", poin: 2 },
    { aksi: "Kegiatan sosial (baksos, donasi)", poin: 3 },
    { aksi: "Saling tolong-menolong", poin: 2 },
  ],
  "Budaya Ramah & Sopan Santun": [
    { aksi: "5S (Senyum, Salam, Sapa, Sopan, Santun)", poin: 2 },
    { aksi: "Menghormati guru dan siswa", poin: 2 },
    { aksi: "Komunikasi positif dan tidak kasar", poin: 2 },
    { aksi: "Etika berbicara dan bertindak", poin: 2 },
    { aksi: "Pelatihan etika digital", poin: 2 },
  ],
  "Budaya Kreativitas & Ekspresi Seni": [
    { aksi: "Lomba seni (lukis, tari, musik)", poin: 3 },
    { aksi: "Ekstrakurikuler seni", poin: 2 },
    { aksi: "Pameran seni dan budaya", poin: 3 },
    { aksi: "Kreasi pakaian adat", poin: 2 },
    { aksi: "Seni kriya daur ulang", poin: 3 },
  ],
  "Budaya Lingkungan (Hijau)": [
    { aksi: "Pemilahan sampah", poin: 2 },
    { aksi: "Program sekolah adiwiyata", poin: 3 },
    { aksi: "Tanam pohon / vertical garden", poin: 3 },
    { aksi: "Pembuatan eco-enzyme atau kompos", poin: 3 },
    { aksi: "Penggunaan botol minum ulang pakai", poin: 2 },
  ],
  "Budaya Digital Positif": [
    { aksi: "Literasi digital", poin: 2 },
    { aksi: "Etika penggunaan media sosial", poin: 2 },
    { aksi: "Pembuatan konten budaya positif", poin: 3 },
    { aksi: "Teknologi untuk pelestarian budaya", poin: 3 },
    { aksi: "Projek video dokumentasi budaya", poin: 3 },
  ]
};

const FormBudaya = () => {
  const [kategori, setKategori] = useState("");
  const [aksi, setAksi] = useState("");
  const [poin, setPoin] = useState(null);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [dataBudaya, setDataBudaya] = useState([]);

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "budaya"));
    const allData = snapshot.docs.map(doc => doc.data());
    setDataBudaya(allData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKategoriChange = (e) => {
    setKategori(e.target.value);
    setAksi("");
    setPoin(null);
    setSubmitted(false);
    setError("");
  };

  const handleAksiChange = (e) => {
    const selected = aksiBudaya[kategori].find((a) => a.aksi === e.target.value);
    setAksi(e.target.value);
    setPoin(selected?.poin || null);
    setSubmitted(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (!nama || !kelas || !kategori || !aksi) {
      setError("Harap lengkapi semua data sebelum mengirim.");
      return;
    }
    try {
      await addDoc(collection(db, "budaya"), {
        nama,
        kelas,
        kategori,
        aksi,
        poin,
        tanggal: new Date().toISOString(),
      });
      setSubmitted(true);
      setError("");
      fetchData(); // refresh data setelah simpan
      // reset form
      setNama("");
      setKelas("");
      setKategori("");
      setAksi("");
      setPoin(null);
    } catch (err) {
      setError("Gagal mengirim data. Silakan coba lagi.");
    }
  };

  const exportToExcel = () => {
    if (dataBudaya.length === 0) return alert("Belum ada data untuk diekspor!");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataBudaya);
    XLSX.utils.book_append_sheet(wb, ws, "Data Budaya");
    XLSX.writeFile(wb, "semua_data_budaya.xlsx");
  };

  const exportToPDF = () => {
    if (dataBudaya.length === 0) return alert("Belum ada data untuk diekspor!");
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Nama", "Kelas", "Kategori", "Aksi", "Poin", "Tanggal"]],
      body: dataBudaya.map(item => [
        item.nama, item.kelas, item.kategori, item.aksi, item.poin, new Date(item.tanggal).toLocaleDateString()
      ]),
    });
    doc.save("semua_data_budaya.pdf");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <div className="mb-4">
        <label className="block mb-1 font-medium"><FaUser className="inline-block mr-2 text-blue-500" />Nama</label>
        <input value={nama} onChange={(e) => setNama(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium"><FaChalkboardTeacher className="inline-block mr-2 text-green-500" />Kelas</label>
        <input value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50" />
      </div>

      <label className="block mb-1 font-medium">Kategori Budaya</label>
      <div className="relative mb-4">
        <select
          value={kategori}
          onChange={handleKategoriChange}
          className="w-full p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih Kategori</option>
          {Object.keys(aksiBudaya).map((kat) => (
            <option key={kat} value={kat}>{kat}</option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
      </div>

      {kategori && (
        <div className="mb-4 p-3 border rounded-md bg-gray-100 flex items-center">
          {kategoriIkon[kategori]}<span className="text-sm font-medium">{kategori}</span>
        </div>
      )}

      {kategori && (
        <>
          <label className="block mb-1 font-medium">Jenis Aksi Budaya</label>
          <div className="relative mb-4">
            <select
              value={aksi}
              onChange={handleAksiChange}
              className="w-full p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Aksi</option>
              {aksiBudaya[kategori].map((item) => (
                <option key={item.aksi} value={item.aksi}>{item.aksi}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </>
      )}

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700"
      >
        <FaSave /> Kirim / Simpan
      </button>

      {submitted && (
        <div className="p-4 mt-4 bg-green-100 text-green-800 rounded-md shadow-inner">
          Data berhasil disimpan!
        </div>
      )}

      <div className="flex justify-between mt-6 gap-2">
        <button
          onClick={exportToExcel}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md flex items-center justify-center gap-2"
        >
          <FaFileExport /> Export Excel
        </button>
        <button
          onClick={exportToPDF}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md flex items-center justify-center gap-2"
        >
          <FaFileExport /> Export PDF
        </button>
      </div>
    </div>
  );
};

export default FormBudaya;
