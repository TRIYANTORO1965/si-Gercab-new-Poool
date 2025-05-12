import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db, auth } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

export default function Lapor() {
  const [user] = useAuthState(auth);
  const isAdmin = user?.uid === "wTKVnPz0hGcjJ6yu9UFGmw70i3i2";

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
  const [penilaian, setPenilaian] = useState({});
  const aspekPenilaian = ["kejelasan", "relevansi", "bukti", "dampak"];

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "laporanLingkungan"));
      const laporanData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        docRef: doc.id
      }));
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

  const handlePenilaianChange = (id, aspek, nilai) => {
    setPenilaian(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [aspek]: parseInt(nilai)
      }
    }));
  };

  const simpanPenilaian = async (id, docRef) => {
    const nilai = penilaian[id];
    if (!nilai) return;

    const total = aspekPenilaian.reduce((sum, aspek) => sum + (nilai[aspek] || 0), 0);
    const predikat =
      total >= 17 ? "Sangat Baik" :
      total >= 13 ? "Baik" :
      total >= 9 ? "Cukup" : "Kurang";

    try {
      await updateDoc(doc(db, "laporanLingkungan", docRef), {
        penilaian: nilai,
        totalNilai: total,
        predikat
      });
      alert("Penilaian berhasil disimpan");
    } catch (err) {
      console.error("Gagal simpan penilaian:", err);
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
      <div className="bg-white p-4 rounded shadow max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Form Laporan Lingkungan</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "nama", label: "Nama" },
              { name: "kelas", label: "Kelas" },
              { name: "lokasi", label: "Lokasi" },
              { name: "hari", label: "Hari" },
              { name: "tanggal", label: "Tanggal", type: "date" },
              { name: "waktu", label: "Waktu", type: "time" },
              { name: "laporan", label: "Laporan" },
              { name: "solusi", label: "Solusi" }
            ].map(({ name, label, type }) => (
              <div key={name} className="flex flex-col">
                <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  type={type || "text"}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" name="tindaklanjut" checked={form.tindaklanjut} onChange={handleChange} className="accent-green-600" />
            Sudah ditindaklanjuti / diatasi? (+5 poin)
          </label>

          <button type="submit" className="mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">Kirim Laporan</button>
        </form>

        {data.length > 0 && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mt-6 justify-center">
              <button onClick={exportExcel} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Export Excel</button>
              <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Export PDF</button>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Laporan Masuk:</h3>
              <ul className="space-y-4">
                {data.map((item, i) => (
                  <li key={i} className="bg-green-50 border border-green-100 p-4 rounded-lg shadow-sm">
                    <div className="mb-2">
                      <p><strong>{item.nama} ({item.kelas})</strong> - <em>{item.lokasi}</em></p>
                      <p><span className="font-semibold">Waktu:</span> {item.hari}, {item.tanggal} - {item.waktu}</p>
                      <p><span className="font-semibold">Laporan:</span> {item.laporan}</p>
                      <p><span className="font-semibold">Solusi:</span> {item.solusi}</p>
                      {item.tindaklanjut && <p className="text-green-700 font-medium">✅ Sudah ditindaklanjuti (+5 poin)</p>}
                      <p className="font-semibold">Poin: {item.poin}</p>
                    </div>

                    {item.penilaian ? (
                      <div className="bg-green-100 p-3 rounded">
                        <p><strong>Nilai:</strong> {item.totalNilai} / 20</p>
                        <p><strong>Predikat:</strong> {item.predikat}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
                          {Object.entries(item.penilaian).map(([aspek, nilai]) => (
                            <span key={aspek}><strong>{aspek}:</strong> {nilai}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      isAdmin && (
                        <div className="bg-yellow-50 p-3 rounded mt-3">
                          <p className="font-semibold mb-2">Beri Penilaian:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {aspekPenilaian.map(aspek => (
                              <input
                                key={aspek}
                                type="number"
                                min="0"
                                max="5"
                                placeholder={aspek}
                                className="border p-1 rounded"
                                value={penilaian[item.id]?.[aspek] || ""}
                                onChange={(e) => handlePenilaianChange(item.id, aspek, e.target.value)}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => simpanPenilaian(item.id, item.docRef)}
                            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Simpan Penilaian
                          </button>
                        </div>
                      )
                    )}
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
