"use client";

import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[220px] md:h-[260px] overflow-hidden">
      <div className="absolute inset-0 flex">
        {/* Left — Teal gradient with headline */}
        <div className="w-[45%] bg-gradient-to-br from-teal-400 via-teal-600 to-teal-700 flex items-center relative z-10">
          <h1 className="text-white text-2xl md:text-[2.5rem] font-bold italic px-6 md:px-12 leading-snug drop-shadow-sm">
            Together, we&apos;re building
            <br />
            the future of aged care.
          </h1>

          {/* Angled edge overlay */}
          <div
            className="absolute top-0 -right-16 h-full w-32 z-20"
            style={{
              background:
                "linear-gradient(105deg, rgb(15 118 110) 40%, transparent 40.5%)",
            }}
          />
        </div>

        {/* Right — Building illustration */}
        <div className="w-[55%] relative bg-white">
          <Image
            src="/building.png"
            alt="Architectural rendering of the Princes Court aged care facility"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Logo badge — top right */}
          <div className="absolute top-4 right-4 md:right-8 z-30 flex items-center gap-2.5 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] text-gray-500 font-semibold tracking-wide">
                princes
              </span>
              <span className="text-[10px] text-teal-600 font-bold tracking-wide">
                court
              </span>
            </div>
            <div className="h-7 w-px bg-gray-300" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-extrabold tracking-tight">
                <span className="text-gray-800">t</span>
                <span className="text-red-500">♥</span>
                <span className="text-gray-800">gether</span>
              </span>
              <span className="text-[8px] text-gray-400 italic mt-0.5">
                we build. we care. we thrive.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
