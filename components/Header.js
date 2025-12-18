"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";
import logo from "@/app/icon.png";
import config from "@/config";

const links = [
  // {
  //   href: "/membership",
  //   label: "Pricing",
  // },
];

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex items-center">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8 h-8 rounded-full"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-serif font-normal text-lg text-black tracking-tight">{config.appName}</span>
          </Link>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-8 lg:items-center lg:flex-1">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="text-gray-600 hover:text-black transition-colors font-medium"
              title={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end">
          <AuthButton />
        </div>

        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="p-2 text-gray-600 hover:text-black transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Your links on small screens */}
            {links.length > 0 && (
              <div className="space-y-2">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="block text-gray-600 hover:text-black transition-colors font-medium py-2"
                    title={link.label}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            
            {/* CTA on small screens */}
            <div className="pt-4 border-t border-gray-200">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
