import Link from 'next/link';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Menu, X } from 'lucide-react'; // ikon responsif

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [nama, setNama] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // toggle menu mobile

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role");
      const storedNama = localStorage.getItem("nama");
      setRole(storedRole);
      setNama(storedNama);
      setIsMounted(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const baseTabs = [
    { href: "/jejak", label: "Jejak" },
    { href: "/budaya", label: "Budaya" },
    { href: "/lapor", label: "Lapor" },
    { href: "/agenda", label: "Agenda" },
    { href: "/galeri", label: "Galeri" },
  ];

  const tabs = role === "admin"
    ? [...baseTabs, { href: "/dashboard", label: "Dashboard" }]
    : baseTabs;

  if (!isMounted) return null;

  return (
    <nav className="bg-yellow-50 shadow-md px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-green-700">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="hidden md:flex items-center gap-4">
            {tabs.map((tab) => {
              const isActive = router.pathname === tab.href;
              return (
                <Link key={tab.href} href={tab.href}>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition ${
                    isActive
                      ? "bg-green-600 text-white shadow"
                      : "text-gray-600 hover:text-green-700"
                  }`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-1">
          {role ? (
            <>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-sm font-semibold text-red-600 hover:text-red-800 rounded-full border border-red-500"
              >
                Logout
              </button>
              <p className="text-xs text-blue-500 font-medium">
  👤 {role === "admin" ? "Admin" : "Siswa"}: {nama}
</p>
            </>
          ) : (
            <Link href="/login">
              <span className="px-4 py-1.5 text-sm font-semibold text-green-700 hover:text-green-800 rounded-full border border-green-600">
                Login
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="mt-3 flex flex-col gap-2 md:hidden">
          {tabs.map((tab) => {
            const isActive = router.pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}>
                <span className={`block px-4 py-2 rounded text-sm font-medium ${
                  isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-green-50"
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
          <div className="border-t pt-2">
            {role ? (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                >
                  Logout
                </button>
                <p className="text-xs text-blue-500 px-4">👤 login sebagai {nama}</p>
              </>
            ) : (
              <Link href="/login">
                <span className="block px-4 py-2 text-green-700 hover:bg-green-50 rounded text-sm">
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
