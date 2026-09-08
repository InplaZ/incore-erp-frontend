import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "../theme/theme.provider";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  it("devuelve el contexto del tema dentro de ThemeProvider", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe("system");
    expect(result.current.resolvedTheme).toBe("light");
    expect(result.current.colorTheme).toBe("rose");
  });

  it("expone setTheme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("expone setColorTheme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setColorTheme("blue");
    });

    expect(result.current.colorTheme).toBe("blue");
  });

  it("permite cambiar el tema y el color independientemente", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme("dark");
      result.current.setColorTheme("violet");
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(result.current.colorTheme).toBe("violet");
  });

  it("lanza un error cuando se utiliza fuera de ThemeProvider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme debe utilizarse dentro de ThemeProvider.");
  });
});
