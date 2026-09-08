import { describe, expect, it } from "vitest";

import { queryClient } from "./query-client";

describe("queryClient", () => {
  it("tiene la configuración global esperada", () => {
    const options = queryClient.getDefaultOptions();

    expect(options.queries?.staleTime).toBe(60_000);
    expect(options.queries?.gcTime).toBe(5 * 60_000);
    expect(options.queries?.retry).toBe(2);
    expect(options.queries?.refetchOnWindowFocus).toBe(true);
    expect(options.queries?.refetchOnReconnect).toBe(true);

    expect(options.mutations?.retry).toBe(0);
  });
});
