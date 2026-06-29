import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardProvider } from "@/contexts/DashboardProvider";
import { prepareUserServerState } from "@/lib/user-server";
import { ExtJSWorkspace } from "./ExtJSWorkspace";

export const metadata = {
  title: "Módulos - CampanhaPro Sencha Workspace",
  description: "Painel modular e integrado estilo Sencha ExtJS",
};

export default async function ModulosPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

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
      initialFinances={userState.finances}
    >
      <ExtJSWorkspace userName={session.name} userEmail={session.email} />
    </DashboardProvider>
  );
}
