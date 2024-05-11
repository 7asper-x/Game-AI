import Conversation from "@/components/Conversation";
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

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allConversations.map((conversation) => (
        <Conversation conversation={conversation} key={conversation.id} />
      ))}
      {allConversations.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any conversations yet. Why don't you create one?"}
        </div>
      )}
    </div>
  );
}
