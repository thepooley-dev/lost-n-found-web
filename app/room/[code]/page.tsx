import type { Metadata } from "next";
import { getRoom } from "@/lib/rooms";
import RoomPageClient from "./client";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  try {
    const room = await getRoom(code);

    if (!room) {
      return {
        title: "Room Not Found - Lost & Found",
        description: "This room may have expired or been deleted.",
      };
    }

    const title = room.name
      ? `${room.name} - Lost & Found`
      : `Room ${code} - Lost & Found`;
    const description = room.name
      ? `Join the Lost & Found room for ${room.name}. Post and track lost items.`
      : `Join this Lost & Found room. Post and track lost items.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "Lost & Found",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: `Room ${code} - Lost & Found`,
      description: "Join this Lost & Found room. Post and track lost items.",
    };
  }
}

export default async function RoomPage({ params }: Props) {
  const { code } = await params;
  return <RoomPageClient roomId={code} />;
}
