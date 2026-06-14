import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardProvider } from "@/contexts/DashboardProvider";
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

  return (
    <DashboardProvider userEmail={session.email}>
      <ExtJSWorkspace userName={session.name} userEmail={session.email} />
    </DashboardProvider>
  );
}
