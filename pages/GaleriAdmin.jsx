<form onSubmit={handleSubmit}>
  <div className="mb-4">
    <label className="block font-semibold mb-1">Nama</label>
    <input
      type="text"
      name="nama"
      value={form.nama}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>

  <div className="mb-4">
    <label className="block font-semibold mb-1">Kelas</label>
    <input
      type="text"
      name="kelas"
      value={form.kelas}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>

  <div className="mb-4">
    <label className="block font-semibold mb-1">Deskripsi</label>
    <textarea
      name="deskripsi"
      value={form.deskripsi}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
      required
    ></textarea>
  </div>

  <div className="mb-4">
    <label className="block font-semibold mb-1">Tanggal</label>
    <input
      type="date"
      name="tanggal"
      value={form.tanggal}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>

  <div className="mb-4">
    <label className="block font-semibold mb-1">Poin</label>
    <input
      type="number"
      name="poin"
      value={form.poin}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    {loading ? "Menyimpan..." : "Simpan Dokumentasi"}
  </button>
</form>
