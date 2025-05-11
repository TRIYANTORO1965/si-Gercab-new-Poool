import Image from "next/image";

export default function Header() {
  return (
    <div className="text-center mb-6 bg-green-100 py-4 px-2">
      <div className="flex flex-wrap justify-center items-center gap-4">
        <Image
          src="/logoku.png"
          alt="Logo GERCAB"
          width={64}
          height={64}
          className="rounded-full w-16 h-16 object-cover"
          priority
        />
        <div className="text-left leading-tight max-w-full overflow-hidden">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">
            <span
              className="text-xl sm:text-2xl italic text-red-600 align-super mr-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Si
            </span>
            <span
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-800 tracking-widest"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              GERCAB
            </span>
          </h1>
          <p className="text-sm text-black leading-snug font-medium">
            Gerakan Cinta Alam dan Budaya
          </p>
          <p className="text-sm sm:text-base font-semibold text-blue-800 mt-1">
            SMP NEGERI 2 KAYEN
          </p>
          <p className="text-xs italic text-gray-400 mt-1">By: @Mr.Tri25</p>
        </div>
      </div>
    </div>
  );
}
