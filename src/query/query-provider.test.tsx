import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";

import { QueryProvider } from "./query-provider";

describe("QueryProvider", () => {
  it("permite ejecutar una query correctamente", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryProvider>{children}</QueryProvider>
    );

    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["test"],
          queryFn: async () => ({
            message: "React Query funciona",
          }),
        }),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      message: "React Query funciona",
    });
  });
});
