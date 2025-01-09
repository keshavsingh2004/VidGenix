import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  fetch: fetch,
  // Set log level for debugging
  logLevel: "Debug"
});
