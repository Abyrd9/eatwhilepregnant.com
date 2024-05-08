import type { WebAppManifest } from "@remix-pwa/dev";
import { json } from "@remix-run/node";

export const loader = () => {
  return json(
    {
      short_name: "EatWhilePregnant",
      name: "EatWhilePregnant",
      description: "Quickly search the safety of foods to eat while pregnant.",
      start_url: "/",
      display: "standalone",
      background_color: "#F1F5F9",
      theme_color: "#0F9A6B",
      icons: [
        {
          src: "/eat-while-pregnant-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "/eat-while-pregnant-rich-install.png",
          sizes: "640x320",
          type: "image/png",
          label: "EatWhilePregnant Search Example",
        },
        {
          src: "/eat-while-pregnant-rich-install.png",
          sizes: "640x320",
          type: "image/png",
          label: "EatWhilePregnant Search Example",
          form_factor: "wide",
        },
      ],
    } as WebAppManifest,
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    }
  );
};
