"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "APP" },
    { href: "/landing", label: "HOME" },
    { href: "/offers", label: "OFFERS" },
    { href: "/mint", label: "MINT" },
    { href: "/make-offer", label: "TRADE" },
    { href: "/my-tokens", label: "TOKENS" },
  ];

  // Show minimal navbar on landing page
  if (pathname === "/landing") {
    return (
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/landing" className="text-2xl font-bold text-white hover:text-[#14F195] transition-colors">
            Troca
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/offers" className="text-gray-300 hover:text-white transition-colors">
              Launch App
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </motion.nav>
    );
  }
  return (
    <nav className="pixel-nav">
      <div className="pixel-container flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Link href="/landing" className="pixel-title text-cyan-400 hover:text-yellow-400 transition-colors">
            TOKEN SWAP
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`pixel-nav-link ${
                pathname === item.href ? "active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center">
          <div className="wallet-adapter-button-wrapper">
            <WalletMultiButton className="pixel-btn-primary !font-pixel !text-xs" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
