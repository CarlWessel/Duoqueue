"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function Navbar() {
  const { signOut, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/matches", label: "Discover", hover: "hover:text-pink-600 dark:hover:text-pink-400" },
    { href: "/matches/list", label: "Matches", hover: "hover:text-blue-600 dark:hover:text-blue-400" },
    { href: "/chat", label: "Messages", hover: "hover:text-green-600 dark:hover:text-green-400" },
    { href: "/profile", label: "Profile", hover: "hover:text-purple-600 dark:hover:text-purple-400" },
  ];

  return (
    <nav className="relative z-50 bg-slate-900 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger button - left side, only if authenticated */}
          {user ? (
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          ) : (
            // Spacer to keep logo centered on mobile when there's no hamburger
            <div className="md:hidden w-10" />
          )}

          {/* Logo: centered on mobile (absolute), inline on desktop */}
          <Link
            href="/"
            className="flex items-center space-x-3 absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0"
          >
            <img
              src={"/duoqueueTransparent.png"}
              alt="Duoqueue"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-gray-300 font-medium transition-colors duration-200 ${link.hover}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Auth button - right side, visible on both mobile and desktop */}
          {user ? (
            <button
              onClick={signOut}
              className="inline-flex items-center px-3 py-2 md:px-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs md:text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-4 h-4 md:mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center px-3 py-2 md:px-4 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs md:text-sm font-medium rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Backdrop overlay - covers rest of page, click to close */}
      {user && (
        <div
          onClick={() => setMenuOpen(false)}
          className={`md:hidden fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Slide-in drawer from the left */}
      {user && (
        <div
          className={`md:hidden fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-gray-700/50 z-50 transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
            <span className="text-gray-300 font-medium">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              aria-label="Close navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-gray-300 font-medium px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 ${link.hover}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}