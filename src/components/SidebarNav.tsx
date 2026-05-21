// src/components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiSearch, FiRadio } from "react-icons/fi";

export default function SidebarNav() {
  const pathname = usePathname(); // Get the current URL path

  const navItems = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Search", href: "/search", icon: FiSearch },
    { name: "IN Radio", href: "/radio", icon: FiRadio },
  ];

  return (
    <nav className="flex flex-col gap-1 mb-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50" // Active styling
                : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50" // Inactive styling
            }`}
          >
            <Icon className={`text-lg ${isActive ? "text-indigo-600" : ""}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
