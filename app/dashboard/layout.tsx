import { redirect } from "next/navigation";
import { DashboardProvider } from "@/contexts/DashboardProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSession } from "@/lib/session";
import { prepareUserServerState } from "@/lib/user-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const userState = await prepareUserServerState(session);

  return (
    <DashboardProvider
      userEmail={session.email}
      initialUser={userState.user}
      initialRegions={userState.regions}
      initialCampaigns={userState.campaigns}
      initialPartners={userState.partners}
      initialLocations={userState.locations}
      initialUsers={userState.users}
      initialRoles={userState.roles}
      initialPermissions={userState.availablePermissions}
    >
      <DashboardShell userName={session.name} userEmail={session.email}>
        {children}
      </DashboardShell>
    </DashboardProvider>
  );
}
