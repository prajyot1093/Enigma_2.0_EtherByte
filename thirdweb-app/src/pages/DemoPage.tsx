import { Link } from "react-router-dom";

const steps = [
  { title: "Connect Wallet", route: "/on-chain", note: "MetaMask needed for chain reads" },
  { title: "Run Analysis", route: "/analyze", note: "Submit sequence to backend" },
  { title: "Track Records", route: "/records", note: "Find generated analysis IDs and submission history" },
  { title: "Verify Transaction", route: "/on-chain", note: "Read registry and oracle state for analysis records" },
  { title: "Review Chain Hub", route: "/blockchain", note: "Understand the on-chain anchoring pipeline" },
];

export function DemoPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-cyan-200">Platform Demo Guide</h2>
        <p className="mt-2 text-sm text-slate-300">
          A single guided flow for users, demos, and testing.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-lg font-medium text-cyan-200">Interactive steps</h3>
        <div className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div>
                <p className="text-sm text-slate-100">{index + 1}. {step.title}</p>
                <p className="text-xs text-slate-400">{step.note}</p>
              </div>
              <Link to={step.route} className="rounded-md border border-cyan-700 px-3 py-1 text-xs text-cyan-200">
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
