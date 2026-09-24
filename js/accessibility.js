/*
 * =========================================================
 * STUDYTASK - ACESSIBILIDADE
 * =========================================================
 *
 * Responsável por:
 * - Modo claro
 * - Modo escuro
 * - Alto contraste
 * - Preferência do sistema operacional
 * - Persistência da preferência do usuário
 * - Atualização dos estados ARIA dos botões
 *
 * =========================================================
 */

const STORAGE_KEY = "studytask-theme";


/**
 * Inicializa o sistema de acessibilidade.
 */
export function initAccessibility() {

  const darkModeButton =
    document.getElementById("darkModeButton");

  const contrastButton =
    document.getElementById("contrastButton");


  /*
   * Verifica se os botões existem.
   *
   * Isso evita erros caso o módulo seja carregado
   * em uma página que não possua os controles.
   */

  if (!darkModeButton || !contrastButton) {
    return;
  }


  /*
   * Recupera o tema salvo anteriormente.
   */

  const savedTheme =
    localStorage.getItem(STORAGE_KEY);


  /*
   * Se o usuário já escolheu um tema,
   * utiliza a escolha dele.
   *
   * Caso contrário, utiliza a preferência
   * do sistema operacional.
   */

  if (isValidTheme(savedTheme)) {

    applyTheme(savedTheme);

  } else {

    applySystemTheme();

  }


  /*
   * Botão de modo escuro.
   */

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


  /*
   * Botão de alto contraste.
   */

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


/**
 * Verifica se o tema salvo é válido.
 */
function isValidTheme(theme) {

  return (
    theme === "light" ||
    theme === "dark" ||
    theme === "high-contrast"
  );

}


/**
 * Aplica a preferência de tema do sistema operacional.
 */
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


/**
 * Aplica um determinado tema.
 */
function applyTheme(theme) {

  /*
   * Remove os temas anteriores.
   */

  document.body.classList.remove(
    "dark-mode",
    "high-contrast"
  );


  /*
   * Aplica o tema escolhido.
   */

  if (theme === "dark") {

    document.body.classList.add("dark-mode");

  }


  if (theme === "high-contrast") {

    document.body.classList.add("high-contrast");

  }


  /*
   * Salva a preferência do usuário.
   */

  localStorage.setItem(
    STORAGE_KEY,
    theme
  );


  /*
   * Atualiza os botões.
   */

  updateAccessibilityButtons(theme);

}


/**
 * Atualiza o estado visual e ARIA dos botões.
 */
function updateAccessibilityButtons(theme) {

  const darkModeButton =
    document.getElementById("darkModeButton");

  const contrastButton =
    document.getElementById("contrastButton");


  if (!darkModeButton || !contrastButton) {
    return;
  }


  /*
   * aria-pressed informa às tecnologias
   * assistivas se o botão está ativo.
   */

  darkModeButton.setAttribute(
    "aria-pressed",
    theme === "dark" ? "true" : "false"
  );


  contrastButton.setAttribute(
    "aria-pressed",
    theme === "high-contrast" ? "true" : "false"
  );


  /*
   * Atualiza o texto do botão de tema.
   */

  if (theme === "dark") {

    darkModeButton.textContent =
      "☀️ Modo claro";

  } else {

    darkModeButton.textContent =
      "🌙 Modo escuro";

  }


  /*
   * Atualiza o texto do botão de contraste.
   */

  if (theme === "high-contrast") {

    contrastButton.textContent =
      "◐ Contraste normal";

  } else {

    contrastButton.textContent =
      "◐ Alto contraste";

  }

}
