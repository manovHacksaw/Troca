"use client"
import { usePathname } from "next/navigation"
import { FloatingDock } from "@/components/aceternity/floating-dock"
import { Home, Coins, PlusCircle, List, Wallet } from "lucide-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function Navbar() {
  const pathname = usePathname()
  const items = [
    { href: "/", label: "Home", icon: <Home className="size-4" />, active: pathname === "/" },
    { href: "/offers", label: "Offers", icon: <List className="size-4" />, active: pathname.startsWith("/offers") },
    { href: "/mint", label: "Mint", icon: <PlusCircle className="size-4" />, active: pathname.startsWith("/mint") },
    {
      href: "/make-offer",
      label: "Trade",
      icon: <Coins className="size-4" />,
      active: pathname.startsWith("/make-offer"),
    },
    {
      href: "/my-tokens",
      label: "Tokens",
      icon: <Wallet className="size-4" />,
      active: pathname.startsWith("/my-tokens"),
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-5 py-5">
        <div className="flex h-14 items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">Troca</div>
          <FloatingDock items={items} />
          <WalletMultiButton className="!h-8 !rounded-lg !text-xs" />
        </div>
      </div>
    </header>
  )
}
