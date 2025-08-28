"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/offers", label: "OFFERS" },
    { href: "/mint", label: "MINT" },
    { href: "/make-offer", label: "TRADE" },
    { href: "/my-tokens", label: "TOKENS" },
  ];

  return (
    <nav className="pixel-nav">
      <div className="pixel-container flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Link href="/" className="pixel-title text-cyan-400 hover:text-yellow-400 transition-colors">
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
