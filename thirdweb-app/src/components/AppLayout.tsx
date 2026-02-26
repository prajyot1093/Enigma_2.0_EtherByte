import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/records", label: "Records" },
  { to: "/on-chain", label: "On-Chain" },
  { to: "/blockchain", label: "Blockchain" },
  { to: "/demo", label: "Demo" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-cyan-900/40 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-cyan-300">eDNA Storage & Analysis Platform</h1>
            <p className="mt-1 text-sm text-slate-400">Clinical Dark · Sepolia · Chainlink Functions</p>
          </div>
          <nav className="flex max-w-4xl flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-900 p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm ${
                    isActive ? "bg-cyan-700 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
