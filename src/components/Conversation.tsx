"use client";

import { Conversation as ConversationModel } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";
import AddEditConversation from "./AddEditConversation";

interface ConversationProps {
  conversation: ConversationModel;
}

export default function Conversation({ conversation }: ConversationProps) {
  const [showEdit, setShowEdit] = useState(false);

  const wasUpdated = conversation.updatedAt > conversation.createdAt;
  const createdOrUpdatedTime = (
    wasUpdated ? conversation.updatedAt : conversation.createdAt
  ).toDateString();

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowEdit(true)}
      >
        <CardHeader>
          <CardTitle>{conversation.title}</CardTitle>
          <CardDescription>
            {createdOrUpdatedTime}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{conversation.content}</p>
        </CardContent>
      </Card>
      <AddEditConversation
        open={showEdit}
        setOpen={setShowEdit}
        conversationToEdit={conversation}
      />
    </>
  );
}
