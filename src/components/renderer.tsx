import Quill from "quill";
import { useEffect, useRef, useState } from "react";
import "quill-mention/autoregister";
import MagicUrl from "quill-magic-url";
import LinkPreview from "./link-previewer";
import { useSearchParams } from "next/navigation";

Quill.register("modules/magicUrl", MagicUrl);
interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();

  const [links, setLinks] = useState<string[]>([]);
  useEffect(() => {
    if (!rendererRef.current) return;
    const jsonValue = JSON.parse(value);
    const container = rendererRef.current;

    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
    });

    quill.enable(false);

    const contents = JSON.parse(value);
    quill.setContents(contents);

    const isEmpty =
      quill
        .getText()
        .replace(/<(.|\n)*?>/g, "")
        .trim().length == 0;
    setIsEmpty(isEmpty);

    container.innerHTML = quill.root.innerHTML;
    const newLinks: string[] = [];
    jsonValue.ops.forEach((op) => {
      if (op.insert && !op.insert?.mention && op.attributes?.link) {
        newLinks.push(op.attributes.link);
      }
    });
    setLinks(newLinks);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [value]);
  if (isEmpty) return null;
  return (
    <>
      <div ref={rendererRef} className="ql-editor ql-renderer" />
      {links.length > 0 && !params.has("parentMessageId") ? (
        <article className="my-4 flex flex-col   gap-2 ">
          {links.map((link, index) => {
            return <LinkPreview url={link} key={link + index} />;
          })}
        </article>
      ) : null}
    </>
  );
};

export default Renderer;
