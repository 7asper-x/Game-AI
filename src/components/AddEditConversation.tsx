import {
  CreateConversationSchema,
  createConversationSchema,
} from "@/lib/validation/conversation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./ui/loading-button";
import { useRouter } from "next/navigation";
import { Conversation } from "@prisma/client";
import { useState } from "react";

interface AddEditConversationProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  conversationToEdit?: Conversation;
}

export default function AddEditConversation({
  open,
  setOpen,
  conversationToEdit,
}: AddEditConversationProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const router = useRouter();
  const form = useForm<CreateConversationSchema>({
    resolver: zodResolver(createConversationSchema),
    defaultValues: {
      title: conversationToEdit?.title || "",
      content: conversationToEdit?.content || "",
    },
  });

  async function onSubmit(input: CreateConversationSchema) {
    try {
      if (conversationToEdit) {
        const response = await fetch("/api/conversations", {
          method: "PUT",
          body: JSON.stringify({ ...input, id: conversationToEdit.id }),
        });

        if (!response.ok) throw Error("Status code: " + response.status);
      } else {
        const response = await fetch("/api/conversations", {
          method: "POST",
          body: JSON.stringify(input),
        });

        if (!response.ok) throw Error("Status code: " + response.status);
        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. please try again.");
    }
  }

  async function deleteConversation() {
    if (!conversationToEdit) return;

    setDeleteInProgress(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "DELETE",
        body: JSON.stringify({
          id: conversationToEdit.id,
        }),
      });

      if (!response.ok) throw Error("Status code: " + response.status);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. please try again.");
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {conversationToEdit ? "Edit Conversation" : "Add Conversation"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conversation title</FormLabel>
                  <FormControl>
                    <Input placeholder="title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-1 sm:gap-0">
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleteInProgress}
              >
                {conversationToEdit ? "Update" : "Submit"}
              </LoadingButton>
              {conversationToEdit && (
                <LoadingButton
                  type="button"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  variant="destructive"
                  onClick={deleteConversation}
                >
                  Delete
                </LoadingButton>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
