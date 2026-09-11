import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomSelector } from "@/components/RoomSelector";

export default async function RoomsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  return <RoomSelector userEmail={user.email} />;
}
