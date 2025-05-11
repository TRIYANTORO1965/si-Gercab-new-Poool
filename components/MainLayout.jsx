import Header from "./Header";
import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-screen-md bg-white shadow-xl rounded-xl p-4 sm:p-6">
        <Header />
        <Navbar />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
