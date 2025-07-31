import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import fs from "node:fs/promises";
import Storage from "./storage";

const getCurrentDate = (): string => {
  // Calculate the expected date string based on the current date
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

describe("Storage", () => {
  beforeAll(async () => {
    // recursive: true -> create dir if not exists, throws Error without it
    await fs.mkdir("/tmp/test-storage", { recursive: true });
  });

  afterAll(async () => {
    await fs.rm("/tmp/test-storage", { recursive: true, force: true });
  });

  beforeEach(() => {
    // Store the original fs.writeFile implementation
    // originalWriteFile = fs.writeFile;
    // // Replace fs.writeFile with a mock function
    // fs.writeFile = vi.fn();
  });

  afterEach(() => {
    // Restore the original fs.writeFile implementation after each test
    // fs.writeFile = originalWriteFile;
    // // Clear all mocks on the vi object
    // vi.clearAllMocks();
  });

  it("should write (append) data to a file with the correct date format", async () => {
    const testDir = "/tmp/test-storage";
    const storage = new Storage(testDir);
    const testValue = "Test content for storage";

    const expectedDate = getCurrentDate();
    const expectedPath = `${testDir}/${expectedDate}`;

    await storage.save(testValue);

    await expect(
      fs.readFile(expectedPath, { encoding: "utf-8" }),
    ).resolves.toContain(testValue);
  });

  it("it should pass", () => {
    const x = 1;
    expect(x).toBe(1);
  });
});
