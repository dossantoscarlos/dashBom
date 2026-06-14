import { redirect } from "next/navigation";

export default function CampanhasRedirectPage() {
  redirect("/modulos?tab=campanhas");
}
