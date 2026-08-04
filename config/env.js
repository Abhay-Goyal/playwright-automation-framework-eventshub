import dotenv from "dotenv";
import path from "path";

if (process.env.GITHUB_ACTIONS !== "true") {
  dotenv.config({
    path: path.join(import.meta.dirname, `../.env/.env.${process.env.ENV}`),
  });
}

export const config = {
  BASE_URL: process.env.BASE_URL,
  TIMEOUT: Number(process.env.TIMEOUT),
};
