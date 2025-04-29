import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";
import config from "@/config";

const link = [
  {
    href: "#about",
    label: "About",
  },
  {
    href: "#planmytrip",
    label: "Plan my trip",
  },
  {
    href: "/auth/signin",
    label: "Account",
  },
];

const Header = () => {
  const router = useRouter();

  const handleLinkClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const sectionId = href.substring(1);
      const element = document.getElementById(sectionId);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push(href);
    }
  };

  return (
    <header className="bg-yellow-50">
      <nav className="container flex items-center justify-between px-8 py-4 mx-auto">
        {/* Logo */}
        <div className="flex flex-1">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-60"
              priority={true}
            />
          </Link>
        </div>
        
        {/* Navigation links
        <div className="flex justify-center gap-12 items-center">
          {links.map((link) => (
            
              key={link.href}
              href={link.href}
              className="link link-hover"
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div> */}

        {/* CTA button */}
        <div className="flex justify-end flex-1">
          <button 
            className="btn btn-primary bg-indigo-900"
            onClick={() => router.push('/auth/signin')}
          >
            Start my plan
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;