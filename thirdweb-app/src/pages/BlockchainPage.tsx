import { Link } from "react-router-dom";

const workflowSteps = [
  {
    step: "01",
    title: "Submit analysis",
    detail: "User enters sequence and contributor wallet in Analyze page.",
  },
  {
    step: "02",
    title: "Pay gas + anchor record",
    detail: "Backend writes registerAnalysis transaction on Sepolia and gets tx hash.",
  },
  {
    step: "03",
    title: "Store + list in Records",
    detail: "Analysis is saved and shown in Records for history tracking.",
  },
  {
    step: "04",
    title: "Verify on-chain",
    detail: "Open On-Chain page to verify registry/oracle state for that analysis ID.",
  },
];

export function BlockchainPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-cyan-200">Blockchain Record Hub</h2>
        <p className="mt-2 text-sm text-slate-300">
          When analysis details are submitted, the backend creates a small gas-fee blockchain transaction to anchor that
          record on-chain. The submission appears in Records for history, and the On-Chain page is used to verify the
          contract state for the same analysis ID.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-400">Chain</p>
            <p className="mt-1 text-sm font-medium text-cyan-100">Ethereum Sepolia</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-400">Registry</p>
            <p className="mt-1 break-all text-xs text-slate-200">0xB24111fe5166D52D12f03587807a6F214bad7B96</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs text-slate-400">NFT</p>
            <p className="mt-1 break-all text-xs text-slate-200">0x08c5273C3848e5efE62bc7A365dF7cd5d8A011A8</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-medium text-cyan-200">Workflow</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {workflowSteps.map((item) => (
            <div key={item.step} className="rounded-md border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-900/40 px-2 py-0.5 text-xs font-semibold text-cyan-200">Step {item.step}</span>
                <p className="text-sm font-medium text-slate-100">{item.title}</p>
              </div>
              <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-medium text-cyan-200">Record pipeline summary</h3>
          <div className="mt-4 space-y-2">
            {workflowSteps.slice(0, 3).map((row) => (
              <div key={row.step} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
                <span className="text-sm text-slate-300">{row.title}</span>
                <span className="text-sm font-medium text-cyan-200">Done sequentially</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-medium text-cyan-200">Continue workflow</h3>
          <div className="mt-4 grid gap-3">
            <Link to="/on-chain" className="rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:border-cyan-700">
              Open Verify On-Chain
            </Link>
            <Link to="/records" className="rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:border-cyan-700">
              Open Analysis Records
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
