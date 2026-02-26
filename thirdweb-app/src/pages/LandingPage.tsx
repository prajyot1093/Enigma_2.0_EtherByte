import { Link } from "react-router-dom";

const quickStats = [
  { label: "Analyses", value: "Live" },
  { label: "Record Flow", value: "On-Chain" },
  { label: "Network", value: "Sepolia" },
  { label: "Oracle", value: "Chainlink" },
];

const steps = [
  {
    title: "Submit sequence",
    description: "Upload genomic sequence and contributor wallet in Analyze page.",
  },
  {
    title: "Review records",
    description: "Track generated analysis IDs and score metadata from backend.",
  },
  {
    title: "Anchor transaction",
    description: "Each submission is registered on-chain so it has a transaction record.",
  },
  {
    title: "Verify status",
    description: "Use On-Chain page to check oracle and registry state for a submitted analysis.",
  },
];

const actions = [
  { to: "/analyze", label: "Start Analysis" },
  { to: "/records", label: "Open Records" },
  { to: "/on-chain", label: "Verify On-Chain" },
  { to: "/blockchain", label: "Blockchain Hub" },
];

export function LandingPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs uppercase tracking-wider text-cyan-400">Platform Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-cyan-100">Genomic Analysis + On-Chain Provenance</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          This interface provides a clean multi-page experience in your Clinical Dark theme, with routes separated for
          landing, analysis, records, and blockchain verification.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {quickStats.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-cyan-200">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-medium text-cyan-200">How it works</h3>
          <div className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="mt-0.5 h-6 w-6 rounded-full bg-cyan-800/60 text-center text-xs leading-6 text-cyan-100">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{step.title}</p>
                  <p className="text-xs text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-medium text-cyan-200">Quick navigation</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-700 hover:text-cyan-200"
              >
                {action.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Theme is unchanged; only route architecture and page-level layout are expanded.
          </p>
        </div>
      </div>
    </section>
  );
}
