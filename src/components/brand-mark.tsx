"use client";

import { useState } from "react";

export function BrandMark({ className = "h-20 w-auto sm:h-24" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-lg font-bold text-[#002A53] shadow-sm"
        aria-hidden="true"
      >
        B
        <span className="absolute inset-x-0 bottom-0 h-1 bg-[#E52437]" />
      </span>
    );
  }

  return (
    <img
      src="/brunel-crest.jpg"
      alt=""
      width={512}
      height={680}
      className={`shrink-0 bg-[#f4f1ea] object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
