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

  useEffect(() => {
    const login = JSON.parse(localStorage.getItem("loginUser"));
    if (!login || login.role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const jejakSnap = await getDocs(collection(db, "jejakHijau"));
      const budayaSnap = await getDocs(collection(db, "budayaHijau"));
      const laporanSnap = await getDocs(collection(db, "laporanLingkungan"));
      const galeriSnap = await getDocs(collection(db, "galeriMedia"));

      const jejak = jejakSnap.docs.map((doc) => doc.data());
      const budaya = budayaSnap.docs.map((doc) => doc.data());
      const laporan = laporanSnap.docs.map((doc) => doc.data());
      const galeri = galeriSnap.docs.map((doc) => ({
        nama: doc.data().nama,
        kelas: doc.data().kelas,
        tanggal: doc.data().tanggal,
        kategori: "Galeri",
        aksi: doc.data().deskripsi,
        lokasi: "-",
        poin: doc.data().poin || 5,
      }));

      const semuaData = [...jejak, ...budaya, ...laporan, ...galeri].map((item) => ({
        ...item,
        kategori: item.kategori || "Laporan",
      }));

      const rekapMap = {};
      const detailMap = {};

      semuaData.forEach((item) => {
        const key = item.nama + "-" + item.kelas;
        if (!rekapMap[key]) {
          rekapMap[key] = {
            nama: item.nama,
            kelas: item.kelas,
            totalPoin: 0,
            jumlahAksi: 0,
          };
          detailMap[key] = [];
        }
        rekapMap[key].totalPoin += item.poin || 0;
        rekapMap[key].jumlahAksi += 1;
        detailMap[key].push(item);
      });

      const rekapArray = Object.values(rekapMap).sort(
        (a, b) => b.totalPoin - a.totalPoin
      );
      setRekap(rekapArray);
      setDetailData(detailMap);

      // 🔥 Simpan ke koleksi Firestore "rekapPoin"
      const saveRekapPromises = rekapArray.map((item) => {
        const docId = `${item.nama}-${item.kelas}`.replace(/\s+/g, "_");
        return setDoc(doc(db, "rekapPoin", docId), {
          ...item,
          updatedAt: new Date(),
        });
      });

      await Promise.all(saveRekapPromises);
      console.log("✅ Rekap berhasil disimpan ke Firestore.");
    };

    fetchData();
  }, []);

  const toggleExpand = (key) => {
    setExpanded(expanded === key ? null : key);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      rekap.map((item) => ({
        Nama: item.nama,
        Kelas: item.kelas,
        "Jumlah Aksi": item.jumlahAksi,
        "Total Poin": item.totalPoin,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Poin Siswa");
    XLSX.writeFile(wb, "rekap_poin_siswa.xlsx");
  };

  const exportPDF = () => {
    const docPDF = new jsPDF();
    docPDF.text("Rekap Poin Semua Aksi Siswa", 14, 16);
    autoTable(docPDF, {
      head: [["No", "Nama", "Kelas", "Jumlah Aksi", "Total Poin"]],
      body: rekap.map((item, i) => [
        i + 1,
        item.nama,
        item.kelas,
        item.jumlahAksi,
        item.totalPoin,
      ]),
      startY: 20,
    });
    docPDF.save("rekap_poin_siswa.pdf");
  };

  const filteredRekap = rekap.filter((item) => {
    const cocokNama = item.nama.toLowerCase().includes(search.toLowerCase());
    const cocokKelas = kelasFilter ? item.kelas === kelasFilter : true;
    return cocokNama && cocokKelas;
  });

  return (
    <MainLayout>
      <div className="bg-white bg-opacity-70 backdrop-blur p-4 rounded shadow font-inter max-w-full overflow-x-auto text-sm sm:text-base">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-indigo-700">
          Dashboard Rekap Semua Aksi Siswa
        </h2>

        {rekap.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-600 mb-2">
              🏆 Top 10 Siswa Berdasarkan Poin
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full table-auto text-sm border bg-white shadow rounded">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="px-3 py-2 border">#</th>
                    <th className="px-3 py-2 border">Nama</th>
                    <th className="px-3 py-2 border">Kelas</th>
                    <th className="px-3 py-2 border text-center">Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {rekap.slice(0, 10).map((item, idx) => (
                    <tr key={idx} className="hover:bg-yellow-50">
                      <td className="px-3 py-2 border text-center font-semibold">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 border">{item.nama}</td>
                      <td className="px-3 py-2 border">{item.kelas}</td>
                      <td className="px-3 py-2 border text-center">
                        {item.totalPoin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            placeholder="🔍 Cari nama siswa..."
            className="border px-3 py-2 rounded w-full text-sm sm:text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded w-full text-sm sm:text-base"
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
          >
            <option value="">🎓 Semua Kelas</option>
            {Array.from(new Set(rekap.map((r) => r.kelas))).map((kelas, i) => (
              <option key={i} value={kelas}>
                {kelas}
              </option>
            ))}
          </select>
          <select
            className="border px-3 py-2 rounded w-full text-sm sm:text-base"
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
          >
            <option value="">🗂️ Semua Kategori</option>
            <option value="Jejak">Jejak</option>
            <option value="Budaya">Budaya</option>
            <option value="Laporan">Laporan</option>
            <option value="Galeri">Galeri</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center items-center">
          <button
            onClick={exportExcel}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full sm:w-auto"
          >
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
          >
            Export PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full table-auto border text-sm shadow bg-white">
            <thead className="bg-indigo-100 text-left">
              <tr>
                <th className="px-3 py-2 border"></th>
                <th className="px-3 py-2 border">Nama</th>
                <th className="px-3 py-2 border">Kelas</th>
                <th className="px-3 py-2 border text-center">Jumlah Aksi</th>
                <th className="px-3 py-2 border text-center">Total Poin</th>
              </tr>
            </thead>
            <tbody>
              {filteredRekap.length > 0 ? (
                filteredRekap.map((item) => {
                  const key = item.nama + "-" + item.kelas;
                  const detailAksi = detailData[key] || [];
                  const filteredDetail = kategoriFilter
                    ? detailAksi.filter(
                        (a) => (a.kategori || "Laporan") === kategoriFilter
                      )
                    : detailAksi;

                  return (
                    <React.Fragment key={key}>
                      <tr className="hover:bg-indigo-50">
                        <td className="px-3 py-2 border text-center">
                          <button
                            onClick={() => toggleExpand(key)}
                            className={`px-2 py-1 rounded-full text-xs font-semibold transition duration-200 ${
                              expanded === key
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {expanded === key ? "⬇️" : "▶️"}
                          </button>
                        </td>
                        <td className="px-3 py-2 border">{item.nama}</td>
                        <td className="px-3 py-2 border">{item.kelas}</td>
                        <td className="px-3 py-2 border text-center">
                          {item.jumlahAksi}
                        </td>
                        <td className="px-3 py-2 border text-center">
                          {item.totalPoin}
                        </td>
                      </tr>
                      {expanded === key && (
                        <tr>
                          <td colSpan="5" className="bg-gray-100">
                            <div className="overflow-x-auto">
                              <table className="w-full table-auto">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="px-3 py-2 border">Tanggal</th>
                                    <th className="px-3 py-2 border">Kategori</th>
                                    <th className="px-3 py-2 border">Aksi</th>
                                    <th className="px-3 py-2 border">Poin</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredDetail.length > 0 ? (
                                    filteredDetail.map((detail, index) => (
                                      <tr key={index}>
                                        <td className="px-3 py-2 border">
                                          {detail.tanggal}
                                        </td>
                                        <td className="px-3 py-2 border">
                                          {detail.kategori}
                                        </td>
                                        <td className="px-3 py-2 border">
                                          {detail.aksi}
                                        </td>
                                        <td className="px-3 py-2 border">
                                          {detail.poin}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="4"
                                        className="px-3 py-2 text-center"
                                      >
                                        Tidak ada detail
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-3 py-2 text-center">
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
