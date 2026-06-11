import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  return <DashboardHome userName={session?.name ?? "Usuário"} />;
}
