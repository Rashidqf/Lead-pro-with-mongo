import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/crm/AppShell";
import { getMe } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const me = await getMe();
    if (!me) throw redirect({ to: "/auth" });
    return { user: me };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
