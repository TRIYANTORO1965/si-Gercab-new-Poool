import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import MainLayout from "../components/MainLayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function DashboardGuru() {
  const [siswaList, setSiswaList] = useState([]);
  const [penilaian, setPenilaian] = useState({});
  const [kelasFilter, setKelasFilter] = useState("");
  const [role, setRole] = useState("");
  const [namaGuruPenilai, setNamaGuruPenilai] = useState("");
  const router = useRouter();

  useEffect(() => {
    const login = JSON.parse(localStorage.getItem("loginUser"));
    if (!login || (login.role !== "guru" && login.role !== "admin")) {
      router.replace("/login");
    } else {
      setRole(login.role);
      setNamaGuruPenilai(login.nama || "");
    }
  }, []);

  useEffect(() => {
    const fetchRekap = async () => {
      const rekapSnap = await getDocs(collection(db, "rekapPoin"));
      const penilaianSnap = await getDocs(collection(db, "penilaianKualitatif"));

      const penMap = {};
      penilaianSnap.forEach((doc) => {
        const data = doc.data();
        const key = `${data.nama}-${data.kelas}`;
        penMap[key] = data;
      });

      const data = rekapSnap.docs.map((doc, idx) => ({ id: doc.id, ...doc.data(), _internalIndex: idx }));
      setSiswaList(
        data.map((s) => {
          const key = `${s.nama}-${s.kelas}`;
          const nilai = penMap[key] || {};

          const aksiPerBulan = s.aksiBulanIni || 0;
          const kategoriTerlibat = Object.entries(s.kategoriPoin || {}).filter(([_, val]) => val > 0).length;

          const otomatisNilai = {
            inisiatif: kategoriTerlibat >= 3 ? 5 : kategoriTerlibat === 2 ? 4 : 3,
            kreativitas: aksiPerBulan >= 6 ? 5 : aksiPerBulan >= 3 ? 4 : 3,
            konsistensi: aksiPerBulan >= 4 ? 5 : aksiPerBulan >= 2 ? 3 : 2,
            kerjasama: 3,
            dampak: 3,
          };

          const totalNilai = ["inisiatif", "kreativitas", "konsistensi", "kerjasama", "dampak"].reduce(
            (sum, k) => sum + (nilai[k] ?? otomatisNilai[k]),
            0
          );

          const predikat = totalNilai >= 40 ? "Inspirator" : totalNilai >= 30 ? "Teladan" : totalNilai >= 20 ? "Peduli" : "Pemula";

          return {
            ...s,
            sudahDinilai: !!penMap[key],
            penilaian: { ...otomatisNilai, ...nilai },
            totalKualitatif: totalNilai,
            predikat,
            namaPenilai: nilai.namaPenilai || "",
          };
        })
      );
    };
    fetchRekap();
  }, []);

  const handleChange = (nama, kelas, field, value) => {
    const key = `${nama}-${kelas}`;
    setPenilaian((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        nama,
        kelas,
        [field]: field === "namaPenilai" ? value : Number(value),
      },
    }));
  };

  const handleSubmit = async (nama, kelas) => {
    if (!namaGuruPenilai.trim()) {
      return alert("Mohon isi Nama Guru Penilai terlebih dahulu.");
    }
    const key = `${nama}-${kelas}`;
    const siswa = siswaList.find((s) => s.nama === nama && s.kelas === kelas);
    const nilai = penilaian[key] || siswa?.penilaian;

    if (!nilai) return alert("Nilai tidak ditemukan.");

    const data = {
      nama,
      kelas,
      ...nilai,
      namaPenilai: namaGuruPenilai,
    };

    await setDoc(doc(db, "penilaianKualitatif", key.replace(/\s+/g, "_")), data, { merge: true });
    alert("Penilaian disimpan!");
    window.location.reload();
  };

  const getKeteranganNilai = (total) => {
    if (total >= 40) return "Baik";
    if (total >= 30) return "Cukup";
    return "Perlu Bimbingan";
  };

  const handleExportPDF = () => {
    const docPDF = new jsPDF();
    autoTable(docPDF, {
      head: [["Nama", "Kelas", "Total Skor", "Predikat", "Nilai Akhir", "Inisiatif", "Kreativitas", "Konsistensi", "Kerjasama", "Dampak", "Nama Penilai"]],
      body: siswaList.map((s) => [
        s.nama,
        s.kelas,
        s.totalKualitatif,
        s.predikat,
        getKeteranganNilai(s.totalKualitatif),
        s.penilaian.inisiatif || 0,
        s.penilaian.kreativitas || 0,
        s.penilaian.konsistensi || 0,
        s.penilaian.kerjasama || 0,
        s.penilaian.dampak || 0,
        namaGuruPenilai,
      ]),
    });
    docPDF.save("penilaian_kualitatif.pdf");
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const getDeskripsi = (nilai) => {
      const aspekKurang = Object.entries(nilai)
        .filter(([k, v]) => ["inisiatif", "kreativitas", "konsistensi", "kerjasama", "dampak"].includes(k) && v < 3)
        .map(([k]) => k);
      if (aspekKurang.length === 0) return "Baik";
      return `Perlu bimbingan dalam hal ${aspekKurang.join(", ")}`;
    };

    const kelasList = [...new Set(siswaList.map((s) => s.kelas))];

    kelasList.forEach((kelas) => {
      const dataKelas = siswaList.filter((s) => s.kelas === kelas);
      const wsData = [
        ["Nama", "Kelas", "Total Skor", "Predikat", "Nilai Akhir", "Deskripsi", "Inisiatif", "Kreativitas", "Konsistensi", "Kerjasama", "Dampak", "Nama Penilai"],
        ...dataKelas.map((s) => {
          const nilai = s.penilaian;
          return [
            s.nama,
            s.kelas,
            s.totalKualitatif,
            s.predikat,
            getKeteranganNilai(s.totalKualitatif),
            getDeskripsi(nilai),
            nilai.inisiatif || 0,
            nilai.kreativitas || 0,
            nilai.konsistensi || 0,
            nilai.kerjasama || 0,
            nilai.dampak || 0,
            namaGuruPenilai,
          ];
        }),
      ];
      const sheet = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, sheet, kelas);
    });

    XLSX.writeFile(workbook, "penilaian_per_kelas.xlsx");
  };

  const aspek = ["inisiatif", "kreativitas", "konsistensi", "kerjasama", "dampak"];
  const semuaKelas = [...new Set(siswaList.map((s) => s.kelas))];
  const filteredSiswa = kelasFilter ? siswaList.filter((s) => s.kelas === kelasFilter) : siswaList;

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h1 className="text-xl font-bold">Dashboard Guru Penilai</h1>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="bg-green-600 text-white px-4 py-2 rounded">
              Export PDF
            </button>
            <button onClick={handleExportExcel} className="bg-blue-600 text-white px-4 py-2 rounded">
              Export Excel
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-6 items-center">
          <div>
            <label className="font-medium mr-2">Filter Kelas:</label>
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Semua Kelas</option>
              {semuaKelas.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium mr-2">Nama Guru Penilai:</label>
            <input
              type="text"
              value={namaGuruPenilai}
              onChange={(e) => setNamaGuruPenilai(e.target.value)}
              placeholder="Masukkan nama guru penilai"
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Nama</th>
                <th className="border p-2">Kelas</th>
                {aspek.map((a) => (
                  <th key={a} className="border p-2 capitalize">
                    {a}
                  </th>
                ))}
                <th className="border p-2">Total</th>
                <th className="border p-2">Predikat</th>
                <th className="border p-2">Nilai Akhir</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.map((siswa, idx) => {
                const key = `${siswa.nama}-${siswa.kelas}`;
                return (
                  <tr key={`${key}-${idx}`}>
                    <td className="border p-2">{siswa.nama}</td>
                    <td className="border p-2">{siswa.kelas}</td>
                    {aspek.map((a) => (
                      <td key={a} className="border p-2">
                        <input
                          type="number"
                          min={0}
                          max={5}
                          value={
                            penilaian[key]?.[a] !== undefined
                              ? penilaian[key][a]
                              : siswa.penilaian?.[a] ?? ""
                          }
                          onChange={(e) => handleChange(siswa.nama, siswa.kelas, a, e.target.value)}
                          className="w-16 border px-1 py-0.5 rounded"
                        />
                      </td>
                    ))}
                    <td className="border p-2 text-center">{siswa.totalKualitatif}</td>
                    <td className="border p-2 text-center">{siswa.predikat}</td>
                    <td className="border p-2 text-center">{getKeteranganNilai(siswa.totalKualitatif)}</td>
                    <td className="border p-2 text-center">
                      {siswa.sudahDinilai ? (
                        <span className="text-green-600 font-medium">✅ Sudah</span>
                      ) : (
                        <span className="text-red-500 font-medium">❌ Belum</span>
                      )}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleSubmit(siswa.nama, siswa.kelas)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Simpan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
