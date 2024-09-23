import { useSubmit } from "@remix-run/react";
import { createContext, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";

type PromptEvent = Event & {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const PWA_FORM_INTENT = "PWA_BANNER_INTENT";

export const PwaBannerFormSchema = z.object({
  status: z.enum(["accepted", "dismissed"]),
  intent: z.literal("PWA_BANNER_INTENT"),
});

const PwaContext = createContext<{
  event?: PromptEvent;
  onDismissInstallPrompt: () => void;
  onAcceptInstallPrompt: () => void;
}>({
  onDismissInstallPrompt: () => {},
  onAcceptInstallPrompt: () => {},
});

type PwaProviderProps = React.ComponentProps<"div"> & {
  status?: "accepted" | "dismissed";
};

export const PwaProvider = ({ status, children }: PwaProviderProps) => {
  const submit = useSubmit();
  const [prompt, setPrompt] = useState<PromptEvent>();

  const handleOnBeforeInstallPrompt = (event: Event) => {
    console.log("Checking for beforeinstallprompt event");
    event.preventDefault();

    // If we have the status of dismissed, it means the cookie is still valid
    // And the user has dismissed the banner within the last 20 days
    if (status === "dismissed") return;

    flushSync(() => {
      setPrompt(event as PromptEvent);
    });
  };

  const handleOnAppInstalled = () => {
    const form = new FormData();
    form.append("intent", PWA_FORM_INTENT);
    form.append("status", "accepted");

    submit(form, {
      action: "/api/set-pwa-banner",
      method: "POST",
      navigate: false,
    });

    setPrompt(undefined);
  };

  const onDismissInstallPrompt = () => {
    const form = new FormData();
    form.append("intent", PWA_FORM_INTENT);
    form.append("status", "dismissed");

    submit(form, {
      action: "/api/set-pwa-banner",
      method: "POST",
      navigate: false,
    });

    setPrompt(undefined);
  };

  const onAcceptInstallPrompt = () => {
    if (!prompt) return;
    prompt.prompt().then((result) => {
      const form = new FormData();
      form.append("intent", PWA_FORM_INTENT);
      form.append("status", result.outcome);

      submit(form, {
        action: "/api/set-pwa-banner",
        method: "POST",
        navigate: false,
      });
    });
  };

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handleOnBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleOnAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleOnBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleOnAppInstalled);
    };
  });

  return (
    <PwaContext.Provider
      value={{ event: prompt, onDismissInstallPrompt, onAcceptInstallPrompt }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePWA must be used within a PwaProvider");
  }

  return context;
};
