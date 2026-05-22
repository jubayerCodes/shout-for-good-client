"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-shrink-0">
          <p className="text-xs text-gray-400">Powered by</p>
          <p className="text-2xl font-black text-gray-900 tracking-tight">Shout.</p>
        </div>
        <div className="text-[10px] text-gray-400 leading-relaxed flex-1">
          <p>
            Shout fundraising services are provided by Shout for Good Pty Ltd (Shout) ABN: 45 163 218 639.
            Our donation forms provide secure donations between donor and charities. Shout is part of the
            ANZ Group but is not a bank. Obligations of Shout are not deposits or liabilities of ANZ. ANZ does
            not stand behind or guarantee{" "}
            <a href="#" className="text-teal-600 hover:underline">Shout</a> or its obligations.
          </p>
          <p className="mt-2">Copyright © 2026</p>
        </div>
        <Link
          href="/admin"
          className="text-xs text-gray-400 hover:text-teal-600 transition-colors underline-offset-4 hover:underline"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
