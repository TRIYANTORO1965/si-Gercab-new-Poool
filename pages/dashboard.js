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

  useEffect(() => {
    const login = JSON.parse(localStorage.getItem("loginUser"));
    if (!login || login.role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const jejakSnap = await getDocs(collection(db, "jejakHijau"));
      const budayaSnap = await getDocs(collection(db, "budaya"));
      const laporanSnap = await getDocs(collection(db, "laporanLingkungan"));

      const jejak = jejakSnap.docs.map((doc) => ({ ...doc.data(), kategori: "Jejak" }));
      const budaya = budayaSnap.docs.map((doc) => ({ ...doc.data(), kategori: "Budaya" }));
      const laporan = laporanSnap.docs.map((doc) => ({ ...doc.data(), kategori: "Laporan" }));

      const semuaData = [...jejak, ...budaya, ...laporan];

      const rekapMap = {};
      const detailMap = {};
      const kelasMap = {};

      semuaData.forEach((item) => {
        const key = item.nama + "-" + item.kelas;
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
            },
          };
          detailMap[key] = [];
        }
        const poin = item.poin || 0;
        rekapMap[key].totalPoin += poin;
        rekapMap[key].jumlahAksi += 1;

        if (item.kategori.includes("Jejak")) {
          rekapMap[key].kategoriPoin.Jejak += poin;
        } else if (item.kategori.includes("Budaya")) {
          rekapMap[key].kategoriPoin.Budaya += poin;
        } else {
          rekapMap[key].kategoriPoin.Laporan += poin;
        }

        detailMap[key].push(item);

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

      const saveRekapPromises = rekapArray.map((item) => {
        const docId = `${item.nama}-${item.kelas}`.replace(/\s+/g, "_");
        return setDoc(doc(db, "rekapPoin", docId), {
          ...item,
          updatedAt: new Date(),
        });
      });

      await Promise.all(saveRekapPromises);
    };

    fetchData();
  }, []);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rekap);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, "rekap_poin.xlsx");
  };

  const exportPDF = () => {
    const docPDF = new jsPDF();
    autoTable(docPDF, {
      head: [["Nama", "Kelas", "Total Poin", "Jejak", "Budaya", "Laporan"]],
      body: rekap.map((item) => [
        item.nama,
        item.kelas,
        item.totalPoin,
        item.kategoriPoin.Jejak,
        item.kategoriPoin.Budaya,
        item.kategoriPoin.Laporan,
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
        head: [["Kategori", "Judul", "Poin", "Tanggal"]],
        body: aksi.map((item) => [
          item.kategori,
          item.judul || item.kegiatan || "",
          item.poin || 0,
          item.tanggal || "",
        ]),
      });
    });
    docPDF.save("laporan_per_siswa.pdf");
  };

  const filteredRekap = rekap.filter((item) => {
    const cocokNama = item.nama.toLowerCase().includes(search.toLowerCase());
    const cocokKelas = kelasFilter ? item.kelas === kelasFilter : true;
    const cocokKategori = kategoriFilter ? item.kategoriPoin[kategoriFilter] > 0 : true;
    return cocokNama && cocokKelas && cocokKategori;
  });

  const displayedRekap = showTop10 ? [...filteredRekap].sort((a, b) => b.totalPoin - a.totalPoin).slice(0, 10) : filteredRekap;

  return (
    <MainLayout>
      <div className="p-4">
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
          <button
            onClick={() => setShowTop10(!showTop10)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {showTop10 ? "Tampilkan Semua" : "Tampilkan Top 10"}
          </button>
          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>
          <button
            onClick={exportLaporanPerSiswa}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Laporan per Siswa (PDF)
          </button>
        </div>

        <div className="overflow-x-auto">
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
                            {detailData[item.nama + "-" + item.kelas]?.map((aksi, i) => (
                              <li key={i} className="whitespace-nowrap">
                                [{aksi.kategori}] {aksi.judul || aksi.kegiatan} — {aksi.poin} poin — {aksi.tanggal}
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
