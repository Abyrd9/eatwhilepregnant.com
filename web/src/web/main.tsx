import { createRoot } from "react-dom/client";
import { App } from "./components/App";

const appRootElement = document.getElementById("root");

if (!appRootElement) {
	throw new Error("Missing #root element.");
}

const appRoot = createRoot(appRootElement);
appRoot.render(<App />);
