document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Recupera a preferência salva
  const savedTheme = localStorage.getItem("theme");

  // Detecta a preferência do sistema
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Define o tema inicial
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  } else if (savedTheme === "high-contrast") {
    body.classList.add("high-contrast");
  } else if (savedTheme === "light") {
    body.classList.remove("dark-mode", "high-contrast");
  } else if (prefersDark) {
    body.classList.add("dark-mode");
  }

  // Botão do modo escuro
  const darkModeButton = document.getElementById("darkModeButton");

  if (darkModeButton) {
    darkModeButton.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      // Remove alto contraste quando ativa o modo escuro
      body.classList.remove("high-contrast");

      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    });
  }

  // Botão de alto contraste
  const contrastButton = document.getElementById("contrastButton");

  if (contrastButton) {
    contrastButton.addEventListener("click", () => {
      body.classList.toggle("high-contrast");

      // Remove modo escuro quando ativa alto contraste
      body.classList.remove("dark-mode");

      if (body.classList.contains("high-contrast")) {
        localStorage.setItem("theme", "high-contrast");
      } else {
        localStorage.setItem("theme", "light");
      }
    });
  }
});
