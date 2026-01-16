import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

// Generate React hooks for file uploads
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
