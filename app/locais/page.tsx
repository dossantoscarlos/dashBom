import { redirect } from "next/navigation";

export default function LocaisRedirectPage() {
  redirect("/modulos?tab=locais");
}
