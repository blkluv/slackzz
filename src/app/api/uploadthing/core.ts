import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
const f = createUploadthing();

export const imagesRouter = {
  imageUploader: f({
    image: {
      /**
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "1MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("doneeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");

    return { fileUrl: file.url };
  }),
} satisfies FileRouter;

export type ImagesRouter = typeof imagesRouter;
export const messagesFilesRouter = {
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
    video: {
      maxFileCount: 2,
      maxFileSize: "8MB",
    },
    pdf: { maxFileCount: 2, maxFileSize: "8MB" },
    text: {
      maxFileCount: 5,
      maxFileSize: "8MB",
    },
  }).onUploadComplete(async ({ file }) => {
    return { fileUrl: file.url, fileSize: file.size, fileName: file.name };
  }),
} satisfies FileRouter;

export type MessagesFilesRouter = typeof messagesFilesRouter;
export const utApi = new UTApi();

// await utApi.deleteFiles([])
