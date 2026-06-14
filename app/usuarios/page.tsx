import { redirect } from "next/navigation";

export default function UsuariosRedirectPage() {
  redirect("/modulos?tab=usuarios");
}
