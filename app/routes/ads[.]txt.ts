import { LoaderFunction } from "@remix-run/node";
import { txt } from "remix-utils/responses";

export const loader: LoaderFunction = async () => {
  return txt("google.com, pub-6846086051700160, DIRECT, f08c47fec0942fa0");
};
