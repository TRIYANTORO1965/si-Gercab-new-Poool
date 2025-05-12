import { FaFacebook, FaYoutube, FaInstagram, FaEnvelope, FaGlobe } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-10 border-t pt-4 text-center text-sm text-gray-600 space-y-2">
      <div className="flex justify-center flex-wrap gap-4 text-lg">
        <a
          href="https://www.facebook.com/smpduakayen"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <FaFacebook />
        </a>
        <a
          href="https://www.youtube.com/@SpendakaTVChanel"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 hover:text-red-700"
        >
          <FaYoutube />
        </a>
        <a
          href="https://www.instagram.com/smpnegeri2kayen"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:text-pink-600"
        >
          <FaInstagram />
        </a>
        <a
          href="mailto:smpduakayen@gmail.com"
          className="text-gray-700 hover:text-gray-900"
        >
          <FaEnvelope />
        </a>
        <a
          href="https://smpn2kayen.sch.id"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-700 hover:text-green-900"
        >
          <FaGlobe />
        </a>
      </div>

      <div className="text-xs text-gray-500 leading-relaxed">
        <p>
          <a href="https://disdikbud.patikab.go.id" target="_blank" rel="noopener noreferrer">
            Dinas Pendidikan dan Kebudayaan Kab. Pati
          </a>{" "}
          |{" "}
          <a href="https://www.patikab.go.id" target="_blank" rel="noopener noreferrer">
            Kabupaten Pati
          </a>{" "}
          |{" "}
          <a href="https://sirida.patikab.go.id/" target="_blank" rel="noopener noreferrer">
            SiRida
          </a>
        </p>
        <p className="mt-1 italic">© 2025 SMP Negeri 2 Kayen</p>
      </div>
    </footer>
  );
}
