import { useEffect, useState } from "react";
import API from "../api";
import type { Analysis } from "../types";

export function RecordsPage({ preselectAnalysisId, onSelectAnalysis }: { preselectAnalysisId?: string; onSelectAnalysis: (analysisId: string) => void }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/analyses", { params: { limit: 30, offset: 0 } });
      setAnalyses(res.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch analyses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  useEffect(() => {
    if (preselectAnalysisId) {
      onSelectAnalysis(preselectAnalysisId);
    }
  }, [preselectAnalysisId, onSelectAnalysis]);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-cyan-200">Analysis Records</h2>
        <button
          onClick={fetchAnalyses}
          disabled={loading}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-100 disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-md border border-slate-800">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-950 text-slate-300">
            <tr>
              <th className="px-3 py-2">Analysis ID</th>
              <th className="px-3 py-2">Gene</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Ready</th>
              <th className="px-3 py-2">Contributor</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {analyses.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-400" colSpan={6}>
                  No records.
                </td>
              </tr>
            ) : (
              analyses.map((item) => (
                <tr key={item._id} className="border-t border-slate-800">
                  <td className="px-3 py-2 font-mono text-xs">{item.analysisId}</td>
                  <td className="px-3 py-2">{item.analysisMetadata?.geneName || "-"}</td>
                  <td className="px-3 py-2">{item.qualityScore?.overallScore ?? "-"}</td>
                  <td className="px-3 py-2">{item.readyForMinting ? "Yes" : "No"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.analysisMetadata?.contributorAddress || "-"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onSelectAnalysis(item.analysisId)}
                      className="rounded-md border border-cyan-700 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-950/40"
                    >
                      Use on-chain
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
