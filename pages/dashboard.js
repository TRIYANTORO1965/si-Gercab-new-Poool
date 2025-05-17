import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../components/MainLayout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [rekap, setRekap] = useState([]);
  const [detailData, setDetailData] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [showTop10, setShowTop10] = useState(false);
  const [rekapPerKelas, setRekapPerKelas] = useState({});
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState("");

  useEffect(() => {
    const login = JSON.parse(localStorage.getItem("loginUser"));
    if (!login || login.role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    fetchAndSync();

    const interval = setInterval(() => {
      fetchAndSync();
    }, 5 * 60 * 1000); // setiap 5 menit

    return () => clearInterval(interval);
  }, []);

  const fetchAndSync = async () => {
    try {
      setSyncStatus("Menyinkronkan data...");

      // ✅ Ambil semua data kategori
      const jejakSnap = await getDocs(collection(db, "jejakHijau"));
      const budayaSnap = await getDocs(collection(db, "budaya"));
      const laporanSnap = await getDocs(collection(db, "laporanLingkungan"));
      const laporSnap = await getDocs(collection(db, "lapor")); // ✅ tambahan kategori

      const clean = (str) => str?.trim().toLowerCase();

      const jejak = jejakSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        kategori: "Jejak",
      }));

      const budaya = budayaSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        kategori: "Budaya",
      }));

      const laporan = laporanSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        kategori: "Laporan",
        poin: doc.data().poin ?? doc.data().skor ?? doc.data().nilai ?? 0,
      }));

      const lapor = laporSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        kategori: "Lapor",
        poin: doc.data().poin ?? doc.data().skor ?? doc.data().nilai ?? 0,
      }));

      const semuaData = [...jejak, ...budaya, ...laporan, ...lapor]; // ✅ digabung

      const rekapMap = {};
      const detailMap = {};
      const kelasMap = {};

      const penilaianSnap = await getDocs(collection(db, "penilaianKualitatif"));
      const penilaianMap = {};
      penilaianSnap.forEach((doc) => {
        const data = doc.data();
        const key = clean(data.nama) + "-" + clean(data.kelas);
        penilaianMap[key] = data;
      });

      semuaData.forEach((item) => {
        const key = clean(item.nama) + "-" + clean(item.kelas);
        const poin = item.poin ?? item.skor ?? item.nilai ?? 0;

        if (!rekapMap[key]) {
          rekapMap[key] = {
            nama: item.nama,
            kelas: item.kelas,
            totalPoin: 0,
            jumlahAksi: 0,
            kategoriPoin: {
              Jejak: 0,
              Budaya: 0,
              Laporan: 0,
              Lapor: 0, // ✅ tambahkan
            },
          };
          detailMap[key] = [];
        }

        rekapMap[key].totalPoin += poin;
        rekapMap[key].jumlahAksi += 1;
        rekapMap[key].kategoriPoin[item.kategori] += poin;
        detailMap[key].push(item);

        const now = new Date();
        const bulanIni = now.getMonth();
        const tahunIni = now.getFullYear();
        const aksiBulanIni = detailMap[key].filter((a) => {
          const tgl = new Date(a.tanggal);
          return tgl.getMonth() === bulanIni && tgl.getFullYear() === tahunIni;
        });
        const jumlahBulanIni = aksiBulanIni.length;
        let aktifLabel = "Pemula";
        if (jumlahBulanIni >= 6) aktifLabel = "Sangat aktif";
        else if (jumlahBulanIni >= 3) aktifLabel = "Aktif";
        else if (jumlahBulanIni >= 1) aktifLabel = "Cukup aktif";

        rekapMap[key].aksiBulanIni = jumlahBulanIni;
        rekapMap[key].aktifLabel = aktifLabel;

        const penilaian = penilaianMap[key];
        if (penilaian) {
          rekapMap[key].penilaian = penilaian;
          const totalKualitatif = [
            penilaian.inisiatif,
            penilaian.kreativitas,
            penilaian.konsistensi,
            penilaian.kerjasama,
            penilaian.dampak,
          ].reduce((a, b) => a + (b || 0), 0);
          rekapMap[key].totalKualitatif = totalKualitatif;

          const totalGabungan = rekapMap[key].totalPoin + totalKualitatif;
          let predikat = "Pemula";
          if (totalGabungan >= 40) predikat = "Inspirator";
          else if (totalGabungan >= 30) predikat = "Teladan";
          else if (totalGabungan >= 20) predikat = "Peduli";
          rekapMap[key].totalGabungan = totalGabungan;
          rekapMap[key].predikat = predikat;
        } else {
          rekapMap[key].totalKualitatif = 0;
          rekapMap[key].totalGabungan = rekapMap[key].totalPoin;
          rekapMap[key].predikat = "Pemula";
        }

        if (!kelasMap[item.kelas]) {
          kelasMap[item.kelas] = {
            totalPoin: 0,
            jumlahAksi: 0,
            jumlahSiswa: 0,
          };
        }
        kelasMap[item.kelas].totalPoin += poin;
        kelasMap[item.kelas].jumlahAksi += 1;
      });

      Object.values(rekapMap).forEach((item) => {
        if (kelasMap[item.kelas]) {
          kelasMap[item.kelas].jumlahSiswa += 1;
        }
      });

      const rekapArray = Object.values(rekapMap).sort(
        (a, b) => b.totalPoin - a.totalPoin
      );

      setRekap(rekapArray);
      setDetailData(detailMap);
      setRekapPerKelas(kelasMap);

      await syncRekapToFirestore(rekapArray);
      const now = new Date();
      setLastSyncTime(now.toLocaleString());
      setSyncStatus("✅ Sinkronisasi berhasil pada " + now.toLocaleTimeString());
    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatus("❌ Gagal menyinkronkan data. Coba lagi nanti.");
    }
  };

  const syncRekapToFirestore = async (rekapArray) => {
    const saveRekapPromises = rekapArray.map((item) => {
      const docId = `${item.nama}-${item.kelas}`.replace(/\s+/g, "_");
      return setDoc(
        doc(db, "rekapPoin", docId),
        {
          ...item,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    });
    await Promise.all(saveRekapPromises);
  };

  const exportExcel = () => {
    const data = rekap.map((item) => ({
      Nama: item.nama,
      Kelas: item.kelas,
      Total_Poin: item.totalPoin,
      Jejak: item.kategoriPoin.Jejak,
      Budaya: item.kategoriPoin.Budaya,
      Laporan: item.kategoriPoin.Laporan,
      Predikat: item.predikat,
      Skor_Kualitatif: item.totalKualitatif,
      Aksi_Bulan_Ini: item.aksiBulanIni,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, "rekap_poin.xlsx");
  };

  const exportPDF = () => {
    const docPDF = new jsPDF();
    autoTable(docPDF, {
      head: [["Nama", "Kelas", "Total Poin", "Jejak", "Budaya", "Laporan", "Predikat", "Skor Kualitatif", "Aksi Bulan Ini"]],
      body: rekap.map((item) => [
        item.nama,
        item.kelas,
        item.totalPoin,
        item.kategoriPoin.Jejak,
        item.kategoriPoin.Budaya,
        item.kategoriPoin.Laporan,
        item.predikat,
        item.totalKualitatif,
        item.aksiBulanIni,
      ]),
    });
    docPDF.save("rekap_poin.pdf");
  };

  const exportLaporanPerSiswa = () => {
    const docPDF = new jsPDF();
    Object.entries(detailData).forEach(([key, aksi], index) => {
      const [nama, kelas] = key.split("-");
      if (index > 0) docPDF.addPage();
      docPDF.text(`Laporan Siswa: ${nama} (${kelas})`, 14, 14);
      autoTable(docPDF, {
        head: [["Kategori", "Jenis", "Judul / Kegiatan", "Poin", "Tanggal"]],
        body: aksi.map((item) => [
          item.kategori,
          item.jenis || "-",
          item.judul || item.kegiatan || item.aksi || item.deskripsi || "(tidak ada judul)",
          item.poin ?? item.skor ?? item.nilai ?? 0,
          item.tanggal || "",
        ]),
      });
    });
    docPDF.save("laporan_per_siswa.pdf");
  };

    const hapusSemuaData = async () => {
    const konfirmasi = confirm("Apakah Anda yakin ingin menghapus SEMUA DATA? Tindakan ini tidak dapat dibatalkan.");
    if (!konfirmasi) return;

    try {
      const koleksi = ["jejakHijau", "budaya", "laporanLingkungan", "rekapPoin"];

      for (const namaKoleksi of koleksi) {
        const snapshot = await getDocs(collection(db, namaKoleksi));
        const hapusPromises = snapshot.docs.map((docItem) => deleteDoc(doc(db, namaKoleksi, docItem.id)));
        await Promise.all(hapusPromises);
      }

      alert("Semua data berhasil dihapus.");
      router.reload();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const hapusDataKategori = async (namaKoleksi) => {
    const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus SEMUA DATA di kategori ${namaKoleksi}?`);
    if (!konfirmasi) return;

    try {
      const snapshot = await getDocs(collection(db, namaKoleksi));
      const hapusPromises = snapshot.docs.map((docItem) =>
        deleteDoc(doc(db, namaKoleksi, docItem.id))
      );
      await Promise.all(hapusPromises);
      alert(`Data dari kategori ${namaKoleksi} berhasil dihapus.`);
      router.reload();
    } catch (error) {
      console.error("Gagal menghapus data kategori:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const hapusDataSiswa = async (namaKoleksi, idDoc) => {
    const konfirmasi = confirm("Apakah Anda yakin ingin menghapus data siswa ini?");
    if (!konfirmasi) return;

    try {
      await deleteDoc(doc(db, namaKoleksi, idDoc));
      alert("Data siswa berhasil dihapus.");
      router.reload();
    } catch (error) {
      console.error("Gagal menghapus data siswa:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

    const filteredRekap = rekap.filter((item) => {
    const cocokNama = item.nama.toLowerCase().includes(search.toLowerCase());
    const cocokKelas = kelasFilter ? item.kelas === kelasFilter : true;
    const cocokKategori = kategoriFilter ? item.kategoriPoin[kategoriFilter] > 0 : true;
    return cocokNama && cocokKelas && cocokKategori;
  });

  const displayedRekap = showTop10
    ? [...filteredRekap].sort((a, b) => b.totalPoin - a.totalPoin).slice(0, 10)
    : filteredRekap;

  return (
    <MainLayout>
      <div className="p-4">
        {syncStatus && <p className="text-sm text-gray-600 mb-2">{syncStatus}</p>}
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <h2 className="font-semibold mb-2">Ringkasan Per Kelas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(rekapPerKelas).map(([kelas, data]) => (
              <div key={kelas} className="p-2 bg-white border rounded shadow">
                <p className="font-medium">{kelas}</p>
                <p>Total Poin: {data.totalPoin}</p>
                <p>Jumlah Aksi: {data.jumlahAksi}</p>
                <p>Jumlah Siswa: {data.jumlahSiswa}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <select
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Semua Kelas</option>
            {[...new Set(rekap.map((r) => r.kelas))].map((kelas) => (
              <option key={kelas} value={kelas}>{kelas}</option>
            ))}
          </select>
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Semua Kategori</option>
            <option value="Jejak">Jejak</option>
            <option value="Budaya">Budaya</option>
            <option value="Laporan">Laporan</option>
          </select>
          <button onClick={() => setShowTop10(!showTop10)} className="bg-blue-600 text-white px-4 py-2 rounded">
            {showTop10 ? "Tampilkan Semua" : "Tampilkan Top 10"}
          </button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded">Export Excel</button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded">Export PDF</button>
          <button onClick={exportLaporanPerSiswa} className="bg-purple-600 text-white px-4 py-2 rounded">Laporan per Siswa (PDF)</button>
          <button onClick={hapusSemuaData} className="bg-black text-white px-4 py-2 rounded">Hapus Semua Data</button>
        </div>

        <button onClick={() => hapusDataKategori("jejakHijau")} className="bg-orange-600 text-white px-4 py-2 rounded">Hapus Jejak</button>
        <button onClick={() => hapusDataKategori("budaya")} className="bg-pink-600 text-white px-4 py-2 rounded">Hapus Budaya</button>
        <button onClick={() => hapusDataKategori("laporanLingkungan")} className="bg-gray-700 text-white px-4 py-2 rounded">Hapus Laporan</button>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Nama</th>
                <th className="border p-2">Kelas</th>
                <th className="border p-2">Total Poin</th>
                <th className="border p-2">Jejak</th>
                <th className="border p-2">Budaya</th>
                <th className="border p-2">Laporan</th>
                <th className="border p-2">Predikat</th>
                <th className="border p-2">Skor Kualitatif</th>
                <th className="border p-2\">Aksi Bulan Ini</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedRekap.map((item, index) => (
                <React.Fragment key={item.nama + item.kelas}>
                  <tr className="hover:bg-gray-100">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{item.nama}</td>
                    <td className="border p-2">{item.kelas}</td>
                    <td className="border p-2">{item.totalPoin}</td>
                    <td className="border p-2">{item.kategoriPoin.Jejak}</td>
                    <td className="border p-2">{item.kategoriPoin.Budaya}</td>
                    <td className="border p-2">{item.kategoriPoin.Laporan}</td>
                    <td className="border p-2">{item.predikat}</td>
                    <td className="border p-2\">{item.totalKualitatif}</td>
                    <td className="border p-2\">{item.aksiBulanIni}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => setExpanded(expanded === index ? null : index)}
                        className="text-blue-500"
                      >
                        {expanded === index ? "Sembunyi" : "Detail"}
                      </button>
                    </td>
                  </tr>
                  {expanded === index && (
                    <tr>
                      <td colSpan="8" className="border p-2 bg-gray-50">
                        <div className="overflow-x-auto">
                          <ul className="list-disc pl-5">
                            {detailData[(item.nama?.trim().toLowerCase() + "-" + item.kelas?.trim().toLowerCase())]?.map((aksi, i) => (
                              <li key={i} className="whitespace-nowrap">
                                [{aksi.kategori}] {aksi.judul || aksi.kegiatan} — {aksi.poin} poin — {aksi.tanggal}
                                <button
                                  onClick={() => hapusDataSiswa(
                                    aksi.kategori === "Jejak"
                                      ? "jejakHijau"
                                      : aksi.kategori === "Budaya"
                                      ? "budaya"
                                      : "laporanLingkungan",
                                    aksi.id
                                  )}
                                  className="ml-2 text-red-600 hover:underline"
                                >
                                  Hapus
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
