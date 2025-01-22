import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const ThumbNail = ({ url }: { url: string | null | undefined }) => {
  if (!url) return null;

  return (
    <article className=" relative overflow-hidden  border rounded-lg my-2 w-fit cursor-zoom-in ">
      <Zoom>
        <Image
          src={url}
          alt="Message Image"
          width={500}
          height={500}
          sizes="(max-width: 768px) 100vw, 500px"
          className="rounded-md object-cover"
          loading="lazy"
        />
      </Zoom>
    </article>
  );
};

export default ThumbNail;
