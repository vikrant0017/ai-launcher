import {
  test,
  expect,
  _electron as electron,
  ElectronApplication,
  Page,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

/*
 * Using Playwright with Electron:
 * https://www.electronjs.org/pt/docs/latest/tutorial/automated-testing#using-playwright
 */

let electronApp: ElectronApplication;

test.beforeAll(async () => {
  const latestBuild = findLatestBuild();
  const appInfo = parseElectronApp(latestBuild);
  process.env.CI = "e2e";

  electronApp = await electron.launch({
    args: [appInfo.main, "--no-sandbox"],
  });

  electronApp.on("window", async (page) => {
    const filename = page.url()?.split("/").pop();
    console.log(`Window opened: ${filename}`);

    page.on("pageerror", (error) => {
      console.error(error);
    });
    page.on("console", (msg) => {
      console.log(msg.text());
    });

    // This is requested at app startup internally
    await page.route("http://localhost:8001/config", async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          watch_dir: "/testdir",
          notes_dir: "/notesdir",
          gemini_api_key: "ABC",
        }),
      });
    });
  });
});

test("Displays the AI searchbox on launch", async () => {
  const page: Page = await electronApp.firstWindow();
  await expect(page.getByRole("searchbox")).toHaveAttribute(
    "placeholder",
    "Chat with AI",
  );
});

test("Loads and shows default config values in Preferences page", async () => {
  const page: Page = await electronApp.firstWindow();
  await page.getByRole("button", { name: "Preferences" }).click();
  await expect(page.getByRole("heading")).toContainText("Preferences");
  await expect(page.getByPlaceholder("API KEY")).toHaveValue("ABC");
  await expect(page.getByPlaceholder("Select Watch Dir")).toHaveValue(
    "/testdir",
  );
  await expect(page.getByPlaceholder("Select Notes Dir")).toHaveValue(
    "/notesdir",
  );
  // Gets back to laucher when closed
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("searchbox")).toHaveAttribute(
    "placeholder",
    "Chat with AI",
  );
});

test.afterAll(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});
