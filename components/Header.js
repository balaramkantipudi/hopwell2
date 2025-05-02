import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";
import config from "@/config";

const links = [
  {
    href: "#about",
    label: "About",
  },
  {
    href: "#globe",
    label: "Spin the Globe",
  },
];

const Header = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    const sectionId = href.substring(1);
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  return (
    <header className="bg-yellow-50">
      <nav className="container flex items-center justify-between px-8 py-4 mx-auto">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-60"
              priority={true}
            />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 domingo5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Desktop navigation links */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link no-underline hover:no-underline header-link" 
              title={link.label}
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA button */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1">
        <button className="btn btn-primary bg-indigo-900"
          onClick={() => router.push('/auth/signin')}>
          Login  </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div className="fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-blue-900 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-8"
                priority={true}
              />
              <span className="font-bold text-lg text-white">
                {config.appName}
              </span>
            </Link>
            <button
              type="button"
              className="text-white"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
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
            </button>
          </div>

          {/* Mobile menu links */}
          <div className="mt-6">
            <div className="flex flex-col gap-y-4 items-start">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white hover:text-yellow-100"
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  {link.label}
                </Link>
              ))}
            <button className="btn btn-primary bg-indigo-900"
                  onClick={() => router.push('/auth/signin')}>
                Login  </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;