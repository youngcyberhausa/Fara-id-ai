import { useState, useEffect } from "react";
import { api } from "../api";
import Logo from "./Logo";
import StepResult from "./StepResult";

export default function SharedCase({ token, onClose }) {
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getSharedCase(token)
      .then((data) => {
        if (!cancelled) setCaseData(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={30} />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900 leading-tight">Fara'id AI</div>
              <div className="text-[11px] text-gray-400 leading-tight">Islamic Inheritance Intelligence</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Buɗe App
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-2.5 mb-4">
          👪 Wannan link ne na kallo kaɗai da wani ya raba da kai — case ne cikin iyali, ba naka ba.
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            Ba a sami wannan case ba — wataƙila an dakatar da raba shi.
          </div>
        )}

        {!caseData && !error && (
          <div className="text-sm text-gray-400 text-center py-10">…</div>
        )}

        {caseData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">{caseData.title}</h2>
            <StepResult result={caseData.result} loading={false} error={null} />
          </div>
        )}
      </main>
    </div>
  );
}
