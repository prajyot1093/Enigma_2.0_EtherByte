import { useState } from "react";
import API from "../api";
import type { Analysis } from "../types";

export function AnalyzePage({ onCreated }: { onCreated: (analysis: Analysis | null) => void }) {
  const [sequence, setSequence] = useState("");
  const [geneName, setGeneName] = useState("BRCA1");
  const [description, setDescription] = useState("Initial eDNA quality assessment");
  const [contributorAddress, setContributorAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const runAnalysis = async () => {
    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const res = await API.post("/analyze", {
        sequence,
        geneName,
        description,
        contributorAddress,
      });

      const created = res.data?.data?.analysis || null;
      onCreated(created);
      setMessage(created?.analysisId ? `Created analysis ${created.analysisId}` : "Analysis submitted");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to run analysis");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-medium text-cyan-200">Run Sequence Analysis</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-300">
          Gene Name
          <input
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            value={geneName}
            onChange={(e) => setGeneName(e.target.value)}
          />
        </label>
        <label className="text-sm text-slate-300">
          Contributor Wallet
          <input
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            value={contributorAddress}
            onChange={(e) => setContributorAddress(e.target.value)}
            placeholder="0x..."
          />
        </label>
      </div>
      <label className="mt-4 block text-sm text-slate-300">
        Description
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="mt-4 block text-sm text-slate-300">
        DNA Sequence
        <textarea
          className="mt-1 h-44 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs outline-none focus:border-cyan-500"
          value={sequence}
          onChange={(e) => setSequence(e.target.value)}
          placeholder="ATCG..."
        />
      </label>
      <button
        onClick={runAnalysis}
        disabled={submitting || !sequence.trim() || !contributorAddress.trim()}
        className="mt-4 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Analysis"}
      </button>
      {(message || error) && (
        <div className={`mt-4 rounded-md border px-3 py-2 text-sm ${error ? "border-rose-700 bg-rose-950/40 text-rose-200" : "border-cyan-800 bg-cyan-950/30 text-cyan-100"}`}>
          {error || message}
        </div>
      )}
    </section>
  );
}
