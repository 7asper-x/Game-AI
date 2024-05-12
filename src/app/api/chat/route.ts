import { conversationIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { ChatCompletionMessage } from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n")
    );

    const { userId } = auth();

    const vectorQueryResponse = await conversationIndex.query({
      vector: embedding,
      topK: 2,
      filter: { userId },
    });

    const relevantConversations = await prisma.conversation.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant Conversations found: ", relevantConversations);

    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      content:
        "You are an intelligent note-taking app. You answer the user's question based on their existing notes or conversations. " +
        "The relevant notes for this query are:\n" +
        relevantConversations
          .map(
            (conversation) =>
              `Title: ${conversation.title}\n\nContent:\n${conversation.content}`
          )
          .join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
