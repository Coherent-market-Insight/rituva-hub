import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "./auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Task attachment uploader - supports all file types
  taskAttachment: f({
    // Images: jpg, png, gif, webp, svg, etc.
    image: { maxFileSize: "16MB" },
    // Videos: mp4, mov, avi, etc.
    video: { maxFileSize: "64MB" },
    // Audio: mp3, wav, etc.
    audio: { maxFileSize: "16MB" },
    // PDFs
    pdf: { maxFileSize: "32MB" },
    // Text files: txt, csv, json, xml, etc.
    text: { maxFileSize: "16MB" },
    // All other file types (including docx, xlsx, pptx, zip, etc.)
    blob: { maxFileSize: "32MB" },
  })
    .middleware(async ({ req }) => {
      // Authenticate user
      const user = await getCurrentUser();

      if (!user) throw new UploadThingError("Unauthorized");

      // Return user info to be available in onUploadComplete
      return { userId: user.userId, userName: user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload completes
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // Return data to the client
      return {
        uploadedBy: metadata.userId,
        fileName: file.name,
        fileUrl: file.url,
        fileSize: file.size,
      };
    }),

  // Avatar/profile picture uploader
  avatarUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploaded for userId:", metadata.userId);
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
