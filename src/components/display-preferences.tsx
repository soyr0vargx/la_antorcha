"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const themes = [
  { id: "sepia", name: "Papel de archivo", swatch: "#ead9b5", text: "#29241d", dark: false },
  { id: "light", name: "Editorial claro", swatch: "#f8fafc", text: "#0f172a", dark: false },
  { id: "obsidian", name: "Obsidiana", swatch: "#09090b", text: "#f4f4f5", dark: true },
  { id: "carbon", name: "Grafito", swatch: "#171717", text: "#e5e5e5", dark: true },
  { id: "navy", name: "Medianoche azul", swatch: "#0b1329", text: "#bae6fd", dark: true },
  { id: "amber", name: "Ámbar terminal", swatch: "#1c1917", text: "#fde68a", dark: true },
  { id: "emerald", name: "Fósforo", swatch: "#052e16", text: "#a7f3d0", dark: true },
  { id: "cyberpunk", name: "Magenta", swatch: "#2e1065", text: "#f5d0fe", dark: true },
] as const;

type ThemeId = (typeof themes)[number]["id"];
const THEME_STORAGE_KEY = "voces-jovenes-theme";
const CURSOR_STORAGE_KEY = "voces-jovenes-scope-cursor";
const THEME_CHANGE_EVENT = "voces-jovenes-theme-change";
const CURSOR_CHANGE_EVENT = "voces-jovenes-cursor-change";

function isThemeId(value: string | null): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function getThemeSnapshot(): ThemeId {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeId(savedTheme) ? savedTheme : "sepia";
}

function subscribeCursor(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CURSOR_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CURSOR_CHANGE_EVENT, callback);
  };
}

function getCursorSnapshot(): boolean {
  return window.localStorage.getItem(CURSOR_STORAGE_KEY) === "true";
}

function saveTheme(theme: ThemeId) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function saveCursorPreference(enabled: boolean) {
  window.localStorage.setItem(CURSOR_STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event(CURSOR_CHANGE_EVENT));
}

export function DisplayPreferences() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "sepia");
  const scopeCursorEnabled = useSyncExternalStore(
    subscribeCursor,
    getCursorSnapshot,
    () => false,
  );
  const cursorRef = useRef<HTMLDivElement>(null);
  const themeSelectorRef = useRef<HTMLDetailsElement>(null);
  const activeTheme = themes.find((option) => option.id === theme) ?? themes[0];

  useEffect(() => {
    const closeThemeMenu = (event: MouseEvent) => {
      if (event.target instanceof Node && !themeSelectorRef.current?.contains(event.target)) {
        themeSelectorRef.current?.removeAttribute("open");
      }
    };

    document.addEventListener("mousedown", closeThemeMenu);
    return () => document.removeEventListener("mousedown", closeThemeMenu);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle("modo-noche", activeTheme.dark);
  }, [activeTheme.dark, theme]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!scopeCursorEnabled || !finePointer.matches || reducedMotion.matches || !cursor) return;

    let frame = 0;
    const moveCursor = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
        cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
        cursor.dataset.visible = "true";
      });
    };
    const hideCursor = () => {
      cursor.dataset.visible = "false";
    };
    const updateHoverState = (event: PointerEvent) => {
      if (event.target instanceof Element) {
        cursor.classList.toggle(
          "is-hovering",
          Boolean(event.target.closest("a, button, input, textarea, select, [role='button']")),
        );
      }
    };

    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("blur", hideCursor);
    document.addEventListener("pointerover", updateHoverState);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("blur", hideCursor);
      document.removeEventListener("pointerover", updateHoverState);
    };
  }, [scopeCursorEnabled]);

  return (
    <>
      <div className="display-preferences">
        <details className="theme-selector" ref={themeSelectorRef}>
          <summary
            aria-label={`Tema actual: ${activeTheme.name}. Abrir selector de temas`}
            className="theme-toggle"
            title="Cambiar tema visual"
          >
            <span className="theme-swatch" style={{ backgroundColor: activeTheme.swatch }} aria-hidden="true" />
            <span className="theme-current-name">{activeTheme.name}</span>
            <span aria-hidden="true">⌄</span>
          </summary>
          <div className="theme-menu" aria-label="Temas visuales">
            {themes.map((option) => (
              <button
                aria-pressed={theme === option.id}
                className="theme-option"
                key={option.id}
                onClick={(event) => {
                  saveTheme(option.id);
                  event.currentTarget.closest("details")?.removeAttribute("open");
                }}
                type="button"
              >
                <span
                  className="theme-option-swatch"
                  style={{ backgroundColor: option.swatch, color: option.text }}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span>{option.name}</span>
                {theme === option.id && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        </details>

        <button
          aria-label={scopeCursorEnabled ? "Desactivar mira visual" : "Activar mira visual"}
          aria-pressed={scopeCursorEnabled}
          className="cursor-toggle"
          onClick={() => saveCursorPreference(!scopeCursorEnabled)}
          title={scopeCursorEnabled ? "Desactivar mira visual" : "Activar mira visual"}
          type="button"
        >
          <span aria-hidden="true">⊕</span>
        </button>
      </div>

      <div aria-hidden="true" className="scope-cursor" ref={cursorRef}>
        <span />
      </div>
    </>
  );
}
