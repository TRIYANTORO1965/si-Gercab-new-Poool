import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { getDoc, doc } from "firebase/firestore";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) router.replace("/");
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { username, password } = form;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        username.toLowerCase(),
        password
      );
      const user = userCredential.user;

      let userDoc = await getDoc(doc(db, "user", user.uid));
      if (!userDoc.exists()) {
        userDoc = await getDoc(doc(db, "siswa", user.uid));
      }

      if (!userDoc.exists()) {
        throw new Error("Data pengguna tidak ditemukan di Firestore.");
      }

      const data = userDoc.data();
      const role = data.role || "siswa";
      const finalNama =
        data.nama && data.nama.trim() !== "" ? data.nama : form.nama;

      localStorage.setItem("role", role);
      localStorage.setItem("nama", finalNama);
      localStorage.setItem(
        "loginUser",
        JSON.stringify({ nama: finalNama, role })
      );

      // ✅ Delay agar localStorage tersimpan sebelum redirect
      setTimeout(() => {
        router.replace("/");
      }, 300);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login gagal. Periksa kembali email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-blue-100 shadow-lg rounded-lg p-6 sm:p-8 w-full max-w-sm text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-10 h-10 relative">
            <Image
              src="/logoku.png"
              alt="Logo GERCAB"
              width={40}
              height={40}
              className="rounded-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <h2 className="text-2xl font-bold text-green-700 flex items-end gap-1">
            <span
              className="text-red-600 italic text-xl align-super"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Si
            </span>
            <span
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="tracking-widest"
            >
              GERCAB
            </span>
          </h2>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="grid gap-4 text-left">
          <input
            name="nama"
            type="text"
            value={form.nama}
            onChange={handleChange}
            className="border p-2 rounded text-sm"
            placeholder="Nama Lengkap"
            required
          />
          <input
            name="username"
            type="email"
            value={form.username}
            onChange={handleChange}
            className="border p-2 rounded text-sm"
            placeholder="Email"
            required
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="border p-2 rounded w-full text-sm"
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>

      <p className="absolute bottom-2 left-2 text-xs italic text-gray-500">
        Aplikasi ini dibuat oleh <strong>@Mr.Tri25</strong>
      </p>
    </div>
  );
}
