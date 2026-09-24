const STORAGE_KEY = "studytask-theme";
export function initAccessibility() {
  const darkModeButton =
    document.getElementById("darkModeButton");
  const contrastButton =
    document.getElementById("contrastButton");
  if (!darkModeButton || !contrastButton) {
    return;
  }
  const savedTheme =
    localStorage.getItem(STORAGE_KEY);
  if (isValidTheme(savedTheme)) {
    applyTheme(savedTheme);
  } else {
    applySystemTheme();
  }
  darkModeButton.addEventListener(
    "click",
    () => {
      const darkModeActive =
        document.body.classList.contains("dark-mode");
      if (darkModeActive) {
        applyTheme("light");
      } else {
        applyTheme("dark");
      }
    }
  );
  contrastButton.addEventListener(
    "click",
    () => {
      const contrastActive =
        document.body.classList.contains("high-contrast");
      if (contrastActive) {
        applyTheme("light");
      } else {
        applyTheme("high-contrast");
      }
    }
  );
}
function isValidTheme(theme) {
  return (
    theme === "light" ||
    theme === "dark" ||
    theme === "high-contrast"
  );
}
function applySystemTheme() {
  const prefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
  if (prefersDark) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }
}
function applyTheme(theme) { 
  document.body.classList.remove(
    "dark-mode",
    "high-contrast"
  );
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  }
  if (theme === "high-contrast") {
    document.body.classList.add("high-contrast");
  }
  localStorage.setItem(
    STORAGE_KEY,
    theme
  );
  updateAccessibilityButtons(theme);
}
function updateAccessibilityButtons(theme) {
  const darkModeButton =
    document.getElementById("darkModeButton");
  const contrastButton =
    document.getElementById("contrastButton");
  if (!darkModeButton || !contrastButton) {
    return;
  }
  darkModeButton.setAttribute(
    "aria-pressed",
    theme === "dark" ? "true" : "false"
  );
  contrastButton.setAttribute(
    "aria-pressed",
    theme === "high-contrast" ? "true" : "false"
  );
  if (theme === "dark") {
    darkModeButton.textContent =
      "☀️ Modo claro";
  } else {
    darkModeButton.textContent =
      "🌙 Modo escuro";
  }
  if (theme === "high-contrast") {
    contrastButton.textContent =
      "◐ Contraste normal";
  } else {
    contrastButton.textContent =
      "◐ Alto contraste";
  }
}
