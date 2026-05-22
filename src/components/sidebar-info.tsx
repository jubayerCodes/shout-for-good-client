"use client";

export default function SidebarInfo() {
  return (
    <aside className="space-y-5">
      {/* Logo badge */}
      <div className="w-24 h-24 rounded-full bg-white border-2 border-teal-600 flex flex-col items-center justify-center shadow-md -mt-12 relative z-10">
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-gray-500">princescourt</span>
          <span className="text-xs font-bold">
            <span className="text-gray-800">t</span>
            <span className="text-red-500">♥</span>
            <span className="text-gray-800">gether</span>
          </span>
          <span className="text-[7px] text-gray-400 italic">we build. we care. we thrive.</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Princes Court, Together</h2>
        <div className="w-10 h-1 bg-teal-600 mt-2 rounded"></div>
      </div>

      {/* Description */}
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p className="font-medium text-gray-700">
          Building the future of aged care in Mildura, together.
        </p>
        <p>
          You&apos;re supporting something meaningful. Princes Court is creating a new 50-bed
          residential aged care home designed to deliver care, dignity, and connection from day one.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>All donations are tax-deductible and welcome – from $2 up to $200,000+</li>
          <li>
            Donate $20,000 or more to secure naming rights for a room, or $125,000 for a
            household, with a commemorative plaque and public recognition (non exclusive)
          </li>
          <li>
            Every contribution helps ensure this first-class facility is complete right from the start
          </li>
        </ul>
        <p className="font-bold text-gray-900">
          Every dollar counts – from $2 to $200,000+, your contribution helps us open the doors of
          this much-needed home.
        </p>
        <p>
          Thank you for helping build a legacy of care, together.
        </p>
      </div>
    </aside>
  );
}
