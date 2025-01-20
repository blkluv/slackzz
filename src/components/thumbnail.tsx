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
            alt="Message Image"
            width={500}
            height={500}
            sizes="(max-width: 768px) 100vw, 500px"
            className="rounded-md object-cover"
            loading="lazy"
          />
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
        <Image
          src={url}
          alt="Message Image"
          width={1000}
          height={1000}
          sizes="(max-width: 768px) 100vw, 1000px" // Adjusted for large screens
          className="rounded-md object-cover"
          loading="eager" // Preload image for dialog view to reduce perceived latency
        />
      </DialogContent>
    </Dialog>
  );
};

export default ThumbNail;
