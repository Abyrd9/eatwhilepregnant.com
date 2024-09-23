import { useMatches } from "@remix-run/react";

export const useGetRouteData = <T,>(id: string) => {
  const matches = useMatches();
  const match = matches.find(
    (match) => match.id.replaceAll("routes/", "") === id
  );

  return match?.data as T;
};
