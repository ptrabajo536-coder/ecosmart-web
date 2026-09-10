import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege esta ruta, pero validamos de nuevo aquí por
  // si el Server Component se renderiza en un contexto sin middleware.
  if (!user || !user.email) {
    redirect("/login");
  }

  return <Dashboard userEmail={user.email} />;
}
