import { PreCallsAdmin } from "@/components/ui/pre-calls-admin";

export const metadata = {
  title: "Pre-Call Submissions | RETAILMavens Admin",
};

export default function PreCallsAdminPage() {
  return (
    <div className="h-screen overflow-hidden">
      <PreCallsAdmin />
    </div>
  );
}
