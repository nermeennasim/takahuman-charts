'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BoxSelect,
  ScatterChart,
  LineChart,
  Layers,
  Grid3X3,
  Box,
  LayoutDashboard,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/charts/bar', label: 'Bar Charts', icon: BarChart3 },
  { href: '/charts/box', label: 'Box Plots', icon: BoxSelect },
  { href: '/charts/scatter', label: 'Scatter Plots', icon: ScatterChart },
  { href: '/charts/line', label: 'Line Charts', icon: LineChart },
  { href: '/charts/contour', label: 'Contour Plots', icon: Layers },
  { href: '/charts/heatmap', label: 'Heatmaps', icon: Grid3X3 },
  { href: '/charts/three-d', label: '3D Charts', icon: Box },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a1628] text-white flex flex-col z-50">
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
            TH
          </div>
          <div>
            <div className="font-bold text-base tracking-tight">TakaHuman</div>
            <div className="text-[11px] text-blue-300/70 tracking-wide">SIMULATION ANALYTICS</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-blue-300/50 uppercase tracking-widest">
          Chart Explorer
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 text-[11px] text-gray-500">
        Built by Nermeen Nasim · 2026
      </div>
    </aside>
  );
}
