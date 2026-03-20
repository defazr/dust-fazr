"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Seoul", href: "/air-quality/seoul-air-quality" },
  { label: "Tokyo", href: "/air-quality/tokyo-air-quality" },
  { label: "Beijing", href: "/air-quality/beijing-air-quality" },
  { label: "New York", href: "/air-quality/new-york-air-quality" },
];

export function StickyHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/60 border-b border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-black tracking-tight text-white hover:text-zinc-300 transition-colors"
        >
          DUST<span className="text-neutral-700">.</span>FAZR
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile: theme + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        ref={menuRef}
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-60 border-t border-[#1e1e1e]" : "max-h-0"
        }`}
      >
        <nav className="px-4 py-3 space-y-1 bg-black/80 backdrop-blur">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 px-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
