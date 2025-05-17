import {
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaGlobe,
  FaTiktok,
  FaTwitter,
} from "react-icons/fa";

import dynamic from "next/dynamic";
const ReactTooltip = dynamic(() => import("react-tooltip").then(mod => mod.ReactTooltip), {
  ssr: false,
});

export default function Footer() {
  return (
    <footer className="mt-10 border-t pt-4 text-center text-sm text-gray-600 space-y-2">
      <div className="flex justify-center flex-wrap gap-4 text-lg">
        <a
          href="https://www.facebook.com/share/12L8qjU67Qw/"
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="social-tooltip"
          data-tooltip-content="Facebook"
          className="text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-full transition"
        >
          <FaFacebook />
        </a>
        <a
          href="https://www.youtube.com/@SpendakaTVChannel"
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="social-tooltip"
          data-tooltip-content="YouTube"
          className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-full transition"
        >
          <FaYoutube />
        </a>
        <a
          href="https://www.instagram.com/smpnegeri2kayen?igsh=YzljYTk1ODg3Zg=="
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="social-tooltip"
          data-tooltip-content="Instagram"
          className="text-pink-500 hover:text-white hover:bg-pink-500 p-2 rounded-full transition"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.tiktok.com/@osissmp2kayen?_t=ZS-8wQrG7xRoif&_r=1"
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="social-tooltip"
          data-tooltip-content="TikTok"
          className="text-black hover:text-white hover:bg-black p-2 rounded-full transition"
        >
          <FaTiktok />
        </a>
        <a
          href="https://x.com/SMPN2KAYEN1985"
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="social-tooltip"
          data-tooltip-content="Twitter"
          className="text-sky-500 hover:text-white hover:bg-sky-500 p-2 rounded-full transition"
        >
          <FaTwitter />
        </a>
        <a
          href="mailto:smpduakayen@gmail.com"
          data-tooltip-id="social-tooltip"
          data-tooltip-content="Email"
          className="text-gray-700 hover:text-white hover:bg-gray-700 p-2 rounded-full transition"
        >
          <FaEnvelope />
        </a>
        <a
          href="https://smpn2kayen.sch.id"
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="social-tooltip"
          data-tooltip-content="Website"
          className="text-green-700 hover:text-white hover:bg-green-700 p-2 rounded-full transition"
        >
          <FaGlobe />
        </a>
      </div>

      <ReactTooltip id="social-tooltip" place="top" effect="solid" className="z-50" />

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
        <p className="mt-1 italic">© SMP Negeri 2 Kayen - Tlp. 0295-4101216 </p>
      </div>
    </footer>
  );
}
