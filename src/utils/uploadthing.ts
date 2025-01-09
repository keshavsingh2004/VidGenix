import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  fetch: fetch,
  token: process.env.UPLOADTHING_TOKEN,
  logLevel: "Debug",
});