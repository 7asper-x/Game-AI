"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddConversation from "@/components/AddConversation";

export default function NavBar() {
  const [showAddConversation, setShowAddConversation] = useState(false);
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
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <Button onClick={() => setShowAddConversation(true)}>
              <Plus size={20} className="mr-2" />
              Add New Conversation
            </Button>
          </div>
        </div>
      </div>
      <AddConversation
        open={showAddConversation}
        setOpen={setShowAddConversation}
      />
    </>
  );
}