// Refunds/page.jsx
import Header from "@/components/layout/navbar";
import Refunds from "@/components/Refund/Refunds";
import Sidebar from "@/components/layout/sidebar";

export default function RefundsPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content (Remove p-6 and margin-left) */}
      <main className="flex flex-col flex-1">
        <Header />
        <div className="px-6 py-4">
          <Refunds />
        </div>
      </main>
    </div>
  );
}