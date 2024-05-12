import { conversationIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createConversationSchema,
  deleteConversationSchema,
  updateConversationSchema,
} from "@/lib/validation/conversation";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = createConversationSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title, content } = parseResult.data;

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForConversation(title, content);

    const conversation = await prisma.$transaction(async (tx) => {
      // The order of these two functions are important, don't change it.
      const conversation = await tx.conversation.create({
        data: {
          title,
          content,
          userId,
        },
      });

      await conversationIndex.upsert([
        {
          id: conversation.id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      return conversation;
    });

    return Response.json({ conversation });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updateConversationSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, title, content } = parseResult.data;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return Response.json({ error: "Note not found" }, { status: 401 });
    }

    const { userId } = auth();

    if (!userId || userId !== conversation.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForConversation(title, content);

    const updatedConversation = await prisma.$transaction(async (tx) => {
      const updatedConversation = await tx.conversation.update({
        where: { id },
        data: {
          title,
          content,
        },
      });

      await conversationIndex.upsert([
        {
          id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      return updatedConversation;
    });

    return Response.json({ updatedConversation }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const parseResult = deleteConversationSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id } = parseResult.data;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return Response.json({ error: "Note not found" }, { status: 401 });
    }

    const { userId } = auth();

    if (!userId || userId !== conversation.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.conversation.delete({ where: { id } });
      await conversationIndex.deleteOne(id);
    });

    return Response.json(
      { message: "Conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getEmbeddingForConversation(
  title: string,
  content: string | undefined
) {
  return getEmbedding(title + "\n\n" + content ?? "");
}
