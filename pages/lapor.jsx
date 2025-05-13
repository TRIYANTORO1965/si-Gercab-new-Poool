import { useState } from "react";
import MainLayout from "../components/MainLayout";
import { db, auth } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Lapor() {
  const [user] = useAuthState(auth);

  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    tanggal: "",
    lokasi: "",
    kategori: "",
    jenis: "",
    aksi: "",
    nilai: "",
    saran: ""
  });

  const [jenisOptions, setJenisOptions] = useState([]);
  const [aksiOptions, setAksiOptions] = useState([]);
  const [customJenis, setCustomJenis] = useState("");
  const [customAksi, setCustomAksi] = useState("");
  const [skorPoin, setSkorPoin] = useState(null);

  const aksiSkor = {
    "Menyapu": 5,
    "Mengumpulkan dan membuang": 5,
    "Ganti tempat sampah": 5,
    "Sosialisasi pemilahan": 4,
    "Pasang label": 3,
    "Bersihkan got": 5,
    "Koordinasi dengan petugas sekolah": 4,
    "Kumpulkan di tempat khusus": 4,
    "Buat program e-waste": 5,
    "Koordinasi dengan kantin": 3,
    "Sediakan tempat sisa makanan": 3,
    "Tutup sementara": 2,
    "Bersihkan": 4,
    "Pasang peringatan": 2,
    "Gunakan wastafel lain": 2,
    "Sediakan sabun": 3,
    "Gunakan pengharum": 2,
    "Buka jendela": 2,
    "Pasang kipas/ventilasi": 4,
    "Menyiram": 3,
    "Ganti tanaman baru": 4,
    "Kerja bakti": 5,
    "Koordinasi dengan OSIS": 4,
    "Penanaman rumput": 4,
    "Pengairan area": 3,
    "Pengajuan penanaman": 3,
    "Pasang tanda peringatan": 2,
    "Bersihkan tembok": 3,
    "Sosialisasi anti vandalisme": 4,
    "Perbaiki": 3,
    "Ajukan penggantian": 3,
    "Matikan lampu": 2,
    "Pasang reminder hemat energi": 3,
    "Matikan bila tidak digunakan": 2,
    "Tingkatkan kesadaran": 3,
    "Pasang sensor otomatis": 4,
    "Tegur siswa": 2,
    "Adakan kampanye kebersihan": 4,
    "Evaluasi piket": 3,
    "Buat sistem penjadwalan ulang": 3,
    "Beri sanksi": 2,
    "Sosialisasi cinta lingkungan": 4,
    "Adakan lomba kelas bersih": 4,
    "Sosialisasi tanggung jawab": 3,
    "Lapor saja": 1
  };

  const kategoriMasalah = {
    "🗑️ Sampah & Kebersihan": {
      "Sampah berserakan di kelas/halaman": ["Menyapu", "Mengumpulkan dan membuang", "Lapor saja"],
      "Tempat sampah penuh atau rusak": ["Ganti tempat sampah", "Lapor saja"],
      "Tidak ada pemilahan sampah organik/anorganik": ["Sosialisasi pemilahan", "Pasang label", "Lapor saja"],
      "Sampah menumpuk di got/saluran air": ["Bersihkan got", "Koordinasi dengan petugas sekolah", "Lapor saja"],
      "Sampah elektronik (kabel, baterai, dsb)": ["Kumpulkan di tempat khusus", "Buat program e-waste", "Lapor saja"],
      "Sisa makanan tercecer di kantin": ["Koordinasi dengan kantin", "Sediakan tempat sisa makanan", "Lapor saja"]
    },
    // kategori lainnya...
  };

  const getSkor = (kategori, aksi) => aksiSkor[aksi] || 2;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "kategori") {
      const jenisMap = kategoriMasalah[value] || {};
      setJenisOptions([...Object.keys(jenisMap), "Lainnya"]);
      setAksiOptions([]);
      setForm((prev) => ({ ...prev, kategori: value, jenis: "", aksi: "" }));
      setSkorPoin(null);
    } else if (name === "jenis") {
      if (value === "Lainnya") {
        setAksiOptions([]);
        setCustomJenis("");
        setForm((prev) => ({ ...prev, jenis: "", aksi: "" }));
        setSkorPoin(null);
      } else {
        const aksiList = kategoriMasalah[form.kategori]?.[value] || [];
        setAksiOptions([...aksiList, "Lainnya"]);
        setForm((prev) => ({ ...prev, jenis: value, aksi: "" }));
        setSkorPoin(null);
      }
    } else if (name === "aksi") {
      if (value === "Lainnya") {
        setCustomAksi("");
        setForm((prev) => ({ ...prev, aksi: "" }));
        setSkorPoin(null);
      } else {
        const skor = getSkor(form.kategori, value);
        setForm((prev) => ({ ...prev, aksi: value, nilai: skor }));
        setSkorPoin(skor);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalJenis = form.jenis || customJenis;
    const finalAksi = form.aksi || customAksi;
    const skor = getSkor(form.kategori, finalAksi);

    if (parseInt(form.nilai) > 5) {
      alert("Nilai maksimal adalah 5 poin.");
      return;
    }

    try {
      await addDoc(collection(db, "laporanLingkungan"), {
        ...form,
        jenis: finalJenis,
        aksi: finalAksi,
        skor,
        waktu: new Date()
      });
      alert(`Laporan berhasil dikirim! Total poin: ${skor}`);
      setForm({ nama: "", kelas: "", tanggal: "", lokasi: "", kategori: "", jenis: "", aksi: "", nilai: "", saran: "" });
      setJenisOptions([]);
      setAksiOptions([]);
      setSkorPoin(null);
    } catch (err) {
      alert("Gagal mengirim laporan");
    }
  };

  const exportExcel = async () => {
    const snapshot = await getDocs(collection(db, "laporanLingkungan"));
    const data = snapshot.docs.map(doc => doc.data());
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "laporan.xlsx");
  };

  const exportPDF = async () => {
    const snapshot = await getDocs(collection(db, "laporanLingkungan"));
    const data = snapshot.docs.map(doc => doc.data());
    const docPDF = new jsPDF();
    autoTable(docPDF, {
      head: [["Nama", "Kelas", "Tanggal", "Lokasi", "Kategori", "Jenis", "Aksi", "Skor", "Saran"]],
      body: data.map(item => [item.nama, item.kelas, item.tanggal, item.lokasi, item.kategori, item.jenis, item.aksi, item.skor, item.saran])
    });
    docPDF.save("laporan.pdf");
  };

  const kelasOptions = [
    "7 A", "7 B", "7 C", "7 D", "7 E", "7 F", "7 G", "7 H", "7 I",
    "8 A", "8 B", "8 C", "8 D", "8 E", "8 F", "8 G", "8 H", "8 I",
    "9 A", "9 B", "9 C", "9 D", "9 E", "9 F", "9 G", "9 H", "9 I"
  ];

  return (
    <MainLayout user={user}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Form Laporan Lingkungan</h2>

        <input name="nama" placeholder="Nama" value={form.nama} onChange={handleChange} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
        
        {/* Dropdown kelas */}
        <select name="kelas" value={form.kelas} onChange={handleChange} className="w-full border p-3 rounded-lg bg-green-50 text-green-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-400" required>
          <option value="">Pilih Kelas</option>
          {kelasOptions.map((kelas) => (
            <option key={kelas} value={kelas}>{kelas}</option>
          ))}
        </select>

        <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />

        <select name="kategori" value={form.kategori} onChange={handleChange} className="w-full border p-3 rounded-lg bg-green-50 text-green-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-400" required>
          <option value="">Pilih Kategori Masalah</option>
          {Object.keys(kategoriMasalah).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        {jenisOptions.length > 0 && (
          <select name="jenis" value={form.jenis} onChange={handleChange} className="w-full border p-3 rounded-lg bg-yellow-50 text-yellow-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400" required>
            <option value="">Pilih Jenis Masalah</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        )}

        {form.jenis === "" && jenisOptions.includes("Lainnya") && (
          <input name="customJenis" placeholder="Tulis jenis masalah" value={customJenis} onChange={(e) => setCustomJenis(e.target.value)} className="w-full border p-3 rounded-lg" required />
        )}

        {aksiOptions.length > 0 && (
          <select name="aksi" value={form.aksi} onChange={handleChange} className="w-full border p-3 rounded-lg bg-blue-50 text-blue-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400" required>
            <option value="">Pilih Aksi</option>
            {aksiOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}

        {form.aksi === "" && aksiOptions.includes("Lainnya") && (
          <input name="customAksi" placeholder="Tulis aksi yang dilakukan" value={customAksi} onChange={(e) => setCustomAksi(e.target.value)} className="w-full border p-3 rounded-lg" required />
        )}

        {skorPoin !== null && (
          <div className="text-sm text-green-800 font-semibold">Skor poin aksi ini: {skorPoin}</div>
        )}

        <input name="lokasi" placeholder="Lokasi Kejadian" value={form.lokasi} onChange={handleChange} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />

        <textarea name="saran" placeholder="Solusi atau saran tambahan (opsional)" value={form.saran} onChange={handleChange} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />

        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition">Kirim</button>
          <button type="button" onClick={exportExcel} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">Ekspor Excel</button>
          <button type="button" onClick={exportPDF} className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition">Ekspor PDF</button>
        </div>
      </form>
    </MainLayout>
  );
}
