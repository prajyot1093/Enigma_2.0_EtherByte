import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AnalyzePage } from "./pages/AnalyzePage";
import { BlockchainPage } from "./pages/BlockchainPage";
import { DemoPage } from "./pages/DemoPage";
import { LandingPage } from "./pages/LandingPage";
import { OnChainPage } from "./pages/OnChainPage";
import { RecordsPage } from "./pages/RecordsPage";

export function App() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState("");

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalyzePage onCreated={(analysis) => setSelectedAnalysisId(analysis?.analysisId || "")} />} />
          <Route
            path="/records"
            element={<RecordsPage preselectAnalysisId={selectedAnalysisId} onSelectAnalysis={setSelectedAnalysisId} />}
          />
          <Route path="/on-chain" element={<OnChainPage seededAnalysisId={selectedAnalysisId} />} />
          <Route path="/blockchain" element={<BlockchainPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
