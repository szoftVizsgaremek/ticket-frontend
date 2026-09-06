import { Outlet } from "react-router-dom";

import Navbar from "@/components/navbar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;