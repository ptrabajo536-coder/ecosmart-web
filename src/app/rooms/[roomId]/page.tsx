import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRooms } from "@/services/deviceService";
import { Dashboard } from "@/components/Dashboard";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const rooms = await listRooms();
  const room = rooms.find((r) => r.id === roomId);

  if (!room) {
    notFound();
  }

  return <Dashboard roomId={room.id} roomName={room.name} userEmail={user.email} />;
}
