import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GameAI - Conversations",
};

export default async function ConversationsPage() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  const allConversations = await prisma.conversation.findMany({
    where: { userId },
  });

  return <div>{JSON.stringify(allConversations)}</div>;
}
