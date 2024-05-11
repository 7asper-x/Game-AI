import prisma from "@/lib/db/prisma";
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

    const conversation = await prisma.conversation.create({
      data: {
        title,
        content,
        userId,
      },
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

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: {
        title,
        content,
      },
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

    await prisma.conversation.delete({ where: { id } });

    return Response.json(
      { message: "Conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
