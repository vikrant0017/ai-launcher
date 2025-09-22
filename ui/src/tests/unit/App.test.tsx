import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import App from "../../App";

// Mock the window.file.save function
if (!window.file) {
  (window as any).file = {
    save: vi.fn(() => Promise.resolve(null)),
  };
}

describe("App component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Preferences when config is not set", async () => {
    // Mock fetch to return an empty config
    vi.spyOn(window, "fetch").mockResolvedValue({
      json: () => Promise.resolve({}),
    } as Response);

    render(<App />);

    // Wait for the component to update after fetching the config
    await waitFor(() => {
      // Check if the Preferences component is rendered
      expect(
        screen.getByRole("heading", { name: /Preferences/i }),
      ).toBeInTheDocument();
    });
  });

  it("renders Launcher when config is set", async () => {
    // Mock fetch to return a complete config
    vi.spyOn(window, "fetch").mockResolvedValue({
      json: () =>
        Promise.resolve({
          gemini_api_key: "test-key",
          watch_dir: "/test/dir",
        }),
    } as Response);

    render(<App />);

    // Wait for the component to update after fetching the config
    await waitFor(() => {
      // Check if the Launcher component is rendered
      expect(screen.getByPlaceholderText(/ask ai.../i)).toBeInTheDocument();
    });
  });
});
