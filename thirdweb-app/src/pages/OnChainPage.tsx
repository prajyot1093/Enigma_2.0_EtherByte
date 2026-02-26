import { useState } from "react";
import { readAnalysisOnChain } from "../web3/readOnChain";

type OnChainResult = Awaited<ReturnType<typeof readAnalysisOnChain>> | null;

export function OnChainPage({ seededAnalysisId }: { seededAnalysisId?: string }) {
  const [analysisId, setAnalysisId] = useState(seededAnalysisId || "");
  const [reading, setReading] = useState(false);
  const [result, setResult] = useState<OnChainResult>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const readOnChain = async () => {
    try {
      setReading(true);
      setError("");
      setMessage("");
      const data = await readAnalysisOnChain(analysisId);
      setResult(data);
      setMessage("On-chain status loaded from MetaMask provider.");
    } catch (err: any) {
      setError(err?.message || "Failed to read chain state");
    } finally {
      setReading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-medium text-cyan-200">Verify Analysis Record On-Chain</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-1">
          <label className="text-sm text-slate-300">
            Analysis ID
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              value={analysisId}
              onChange={(e) => setAnalysisId(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={readOnChain}
            disabled={reading || !analysisId}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-100 disabled:opacity-60"
          >
            {reading ? "Reading..." : "Read On-Chain"}
          </button>
        </div>

        {(message || error) && (
          <div className={`mt-4 rounded-md border px-3 py-2 text-sm ${error ? "border-rose-700 bg-rose-950/40 text-rose-200" : "border-cyan-800 bg-cyan-950/30 text-cyan-100"}`}>
            {error || message}
          </div>
        )}
      </div>

      {result && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-semibold text-cyan-200">Oracle</h3>
            <p className="mt-2 text-sm text-slate-300">Score: {result.oracle.qualityScore}</p>
            <p className="text-sm text-slate-300">Ready: {String(result.oracle.readyForMint)}</p>
            <p className="text-xs text-slate-400">Status: {result.oracle.status}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-semibold text-cyan-200">Registry</h3>
            <p className="mt-2 text-sm text-slate-300">Oracle verified: {String(result.registry.oracleVerified)}</p>
            <p className="text-sm text-slate-300">Minted: {String(result.registry.minted)}</p>
            <p className="text-xs text-slate-400 break-all">Metadata: {result.registry.metadataURI}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-semibold text-cyan-200">NFT</h3>
            <p className="mt-2 text-sm text-slate-300">Mintable: {String(result.mintable)}</p>
            <p className="text-sm text-slate-300">Token ID: {result.tokenId || "-"}</p>
            <p className="text-xs text-slate-400 break-all">Owner: {result.tokenOwner || "-"}</p>
          </div>
        </div>
      )}
    </section>
  );
}
