import { createFileRoute, Outlet } from "@tanstack/react-router";

import { FinanceSubNav } from "@/components/finance/FinanceShared";

export const Route = createFileRoute("/_authenticated/finance")({
  component: FinanceLayout,
});

function FinanceLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue, expenses, profitability, and outstanding payments.
        </p>
      </div>
      <FinanceSubNav />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
