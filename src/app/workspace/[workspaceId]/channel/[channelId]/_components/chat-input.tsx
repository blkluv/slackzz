import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkSpaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../../convex/_generated/dataModel";

interface ChatInputProps {
  placeholder: string;
}

type CreateMessageValue = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

const ChatInput = ({ placeholder }: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);
  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const workspaceId = useWorkSpaceId();
  const channelId = useChannelId();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string; // Quill Delta JSON string
    image: File | null;
  }) => {
    try {
      editorRef.current?.enable(false);
      setIsPending(true);

      const jsonBody = JSON.parse(body);

      jsonBody.ops.forEach((op: any) => {
        if (op.insert && op.insert.mention) {
          const mention = op.insert.mention;
          const { denotationChar, value, id } = mention;

          if (denotationChar === "@") {
            const currentUrl = window.location.href;

            const url = new URL(currentUrl);

            url.searchParams.set("profileMemberId", id);

            const updatedUrl = url.toString();

            toast.success(`You mentioned @${value}!`);
            op.attributes = {
              color: "#1d1c1d",
              link: updatedUrl,
            };
          } else if (denotationChar == "#") {
            op.attributes = {
              color: "#1d1c1d",
              link: `/workspace/${workspaceId}/channel/${id}`,
            };
          }
        }
      });

      // Prepare the message values
      const values: CreateMessageValue = {
        body: JSON.stringify(jsonBody),
        channelId,
        workspaceId,
        image: undefined,
      };

      // If there's an image, handle uploading
      if (image) {
        const url = await generateUploadUrl(null, { throwError: true });

        if (!url) throw new Error("Url not found");

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();
        values.image = storageId;
      }

      // Send the message
      createMessage(values, { throwError: true });
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send text");
      console.log(error);
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        variant="create"
        placeHolder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};

export default ChatInput;
