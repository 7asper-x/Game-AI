"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddEditConversation from "@/components/AddEditConversation";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import AIChatButton from "@/components/AIChatButton";

export default function NavBar() {
  const { theme } = useTheme();
  const [showAddEditConversation, setShowAddEditConversation] = useState(false);
  return (
    <>
      <div className="p-4 shadow">
        <div className="max-w-7xl m-auto flex flex-wrap gap-3 items-center justify-between">
          <Link href="/conversations" className="flex items-center gap-1">
            <Image src={logo} alt="GameAI logo" width={50} height={50} />
            <span className="font-bold">GameAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <ThemeToggleButton />
            <Button onClick={() => setShowAddEditConversation(true)}>
              <Plus size={20} className="mr-2" />
              Add New Conversation
            </Button>
            <AIChatButton />
          </div>
        </div>
      </div>
      <AddEditConversation
        open={showAddEditConversation}
        setOpen={setShowAddEditConversation}
      />
    </>
  );
}
