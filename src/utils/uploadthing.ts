import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  fetch: fetch,
  logLevel: "Debug",
});
