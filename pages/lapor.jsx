import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Lapor() {
  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    lokasi: "",
    hari: "",
    tanggal: "",
    waktu: "",
    laporan: "",
    solusi: "",
    tindaklanjut: false,
    poin: 0
  });

  const [data, setData] = useState([]);

  // Ambil data dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "laporanLingkungan"));
      const laporanData = querySnapshot.docs.map(doc => doc.data());
      setData(laporanData);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        tindaklanjut: checked,
        poin: checked ? 5 : 0
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "laporanLingkungan"), form);
      setData(prev => [...prev, form]);
      setForm({
        nama: "",
        kelas: "",
        lokasi: "",
        hari: "",
        tanggal: "",
        waktu: "",
        laporan: "",
        solusi: "",
        tindaklanjut: false,
        poin: 0
      });
    } catch (error) {
      console.error("Gagal simpan ke Firestore:", error);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Nama: item.nama,
        Kelas: item.kelas,
        Lokasi: item.lokasi,
        Hari: item.hari,
        Tanggal: item.tanggal,
        Waktu: item.waktu,
        Laporan: item.laporan,
        Solusi: item.solusi,
        TindakLanjut: item.tindaklanjut ? "Sudah" : "Belum",
        Poin: item.poin
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Lingkungan");
    XLSX.writeFile(wb, "laporan_lingkungan.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Lingkungan Sekolah", 14, 16);
    autoTable(doc, {
      head: [["Nama", "Kelas", "Lokasi", "Hari", "Tanggal", "Waktu", "Laporan", "Solusi", "Tindak Lanjut", "Poin"]],
      body: data.map((item) => [
        item.nama,
        item.kelas,
        item.lokasi,
        item.hari,
        item.tanggal,
        item.waktu,
        item.laporan,
        item.solusi,
        item.tindaklanjut ? "Sudah" : "Belum",
        item.poin
      ]),
      startY: 20
    });
    doc.save("laporan_lingkungan.pdf");
  };

  return (
    <MainLayout>
      <div className="bg-glass p-4">
        <h2 className="text-xl font-semibold mb-4 text-green-700">Form Laporan Lingkungan</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {["nama", "kelas", "lokasi", "hari", "tanggal", "waktu", "laporan", "solusi"].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="border p-2 rounded"
                type={field === "tanggal" ? "date" : field === "waktu" ? "time" : "text"}
                required
              />
            ))}
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="tindaklanjut" checked={form.tindaklanjut} onChange={handleChange} />
            Sudah ditindaklanjuti / diatasi? (+5 poin)
          </label>

          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-pink-700">
            Kirim Laporan
          </button>
        </form>

        {data.length > 0 && (
          <>
            <div className="flex gap-4 mt-6 justify-center">
              <button onClick={exportExcel} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Export Excel</button>
              <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Export PDF</button>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Laporan Masuk:</h3>
              <ul className="space-y-4 text-sm">
                {data.map((item, i) => (
                  <li key={i} className="bg-green-50 border p-3 rounded shadow">
                    <p><strong>{item.nama} ({item.kelas})</strong> - <em>{item.lokasi}</em></p>
                    <p><span className="font-semibold">Waktu:</span> {item.hari}, {item.tanggal} - {item.waktu}</p>
                    <p><span className="font-semibold">Laporan:</span> {item.laporan}</p>
                    <p><span className="font-semibold">Solusi:</span> {item.solusi}</p>
                    {item.tindaklanjut && <p className="text-green-700 font-medium">✅ Sudah ditindaklanjuti (+5 poin)</p>}
                    <p className="font-semibold">Poin: {item.poin}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
