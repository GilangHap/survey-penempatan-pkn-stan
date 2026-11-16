"use client";

import dynamic from "next/dynamic";

const SurveyWizard = dynamic(() => import("@/components/SurveyWizard"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center py-24 text-sm text-slate-400">
      Memuat survei...
    </div>
  ),
});

export default function Home() {
  return <SurveyWizard />;
}
