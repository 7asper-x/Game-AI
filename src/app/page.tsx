import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/conversations");

  return (
    <main className="flex flex-col h-screen items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="GameAI logo" width={120} height={120} />
        <span className="font-extrabold tracking-tight text-4xl lg:text-5xl">
          GameAI
        </span>
      </div>
      <p className="text-center max-w-prose">
        An intelligent chatbot app with multiple AIs integration, built with
        OpenAI, Gemini and Claude.
      </p>
      <Button size="lg" asChild>
        <Link href="/conversations">Open</Link>
      </Button>
    </main>
  );
}
