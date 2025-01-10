import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateWorkspaceModal } from "../store/use-get-workspace-modal";
import { UploadButton } from "@/lib/utils";
import imageCompression from "browser-image-compression";

const CreateWorkspaceModal = () => {
  const [open, setOpen] = useCreateWorkspaceModal();
  const { mutate, isPending } = useCreateWorkspace();
  const [name, setName] = useState("");
  const router = useRouter();
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);
  // const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false); // State for controlling upload status

  useEffect(() => {
    if (progress === 100) {
      console.log("supposed to send client done response now");
      setIsDone(true);
    } else {
      setIsDone(false);
    }
  }, [progress]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { name },
      {
        onSuccess(id) {
          toast.success("Workspace created");
          router.push(`/workspace/${id}`);
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
  };

  const handleImageUpload = async (file: File[]): Promise<File[]> => {
    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 500,
        quality: 0.3,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file[0], options);
      setProgress(0);

      return [compressedFile];
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  }; //WIP: FINISHING UPLOAD BUTTON, DUE TO SOME REASON IT'S NOT TRIGGERING onClientUploadComplete

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            disabled={isPending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            minLength={3}
            placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
          />
          {isDone && progress}
          <UploadButton
            endpoint="imageUploader"
            onUploadProgress={(p) => {
              setProgress(p);
            }}
            onUploadBegin={() => {
              setUploading(true);
              console.log("start uploading");
            }}
            onClientUploadComplete={(res) => {
              console.log("Upload completed:", res);
              setUploading(false);
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
              setUploading(false); // Handle upload error
            }}
            onBeforeUploadBegin={handleImageUpload}
          />

          <div className="flex justify-end">
            <Button disabled={isPending || uploading}>Create</Button>{" "}
            {/* Disable the button during uploading */}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
