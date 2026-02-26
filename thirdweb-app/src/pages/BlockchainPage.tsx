import { Link } from "react-router-dom";

const recordRows = [
  { item: "Submission", detail: "Create analysis + save in database" },
  { item: "On-chain anchor", detail: "Register analysis in registry contract" },
  { item: "Gas paid", detail: "Wallet transaction confirms immutable record" },
];

export function BlockchainPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-cyan-200">Blockchain Record Hub</h2>
        <p className="mt-2 text-sm text-slate-300">
          This project is focused on genomic analysis record storage. Every analysis submission is anchored on-chain so
          each record has a transaction and gas-backed audit trail.
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-medium text-cyan-200">Record pipeline</h3>
          <div className="mt-4 space-y-2">
            {recordRows.map((row) => (
              <div key={row.item} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
                <span className="text-sm text-slate-300">{row.item}</span>
                <span className="text-sm font-medium text-cyan-200">{row.detail}</span>
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
