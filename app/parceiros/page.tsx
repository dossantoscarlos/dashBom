import { redirect } from "next/navigation";

export default function ParceirosRedirectPage() {
  redirect("/modulos?tab=parceiros");
}
