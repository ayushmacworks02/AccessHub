import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "@/providers/app-provider";
import App from "@/App";
import "@/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);