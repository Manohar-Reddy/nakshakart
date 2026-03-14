"use client";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
}

export default function ImageViewer({ src, alt, className, caption }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="cursor-pointer" onClick={() => setOpen(true)}>
        <img src={src} alt={alt} className={className} />
        {caption && (
          <p className="text-xs text-center text-gray-400 mt-1">🔍 {caption}</p>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center px-4"
          onClick={() => setOpen(false)}>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-80 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition z-10">
            ✕
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {caption && (
            <p className="absolute bottom-6 left-0 right-0 text-center text-white text-sm opacity-75">
              {caption}
            </p>
          )}
          <p className="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-xs">
            Click anywhere outside to close
          </p>
        </div>
      )}
    </>
  );
}