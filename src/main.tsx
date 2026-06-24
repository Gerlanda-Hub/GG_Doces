import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>
);

// Hide the loading splash once the app is mounted
setTimeout(() => {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 600);
  }
}, 600);
