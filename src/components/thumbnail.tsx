import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

const ThumbNail = ({ url }: { url: string | null | undefined }) => {
  if (!url) return null;

  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative overflow-hidden min-w-[360px] border rounded-lg my-2 cursor-zoom-in">
          <Image
            src={url}
            width={1000}
            height={1000}
            alt="Message Image"
            className="rounded-md  object-cover size-full"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
        <Image
          src={url}
          width={1000}
          height={1000}
          alt="Message Image"
          className="rounded-md  object-cover size-full"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ThumbNail;
