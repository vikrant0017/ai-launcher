// Handle all local storage related interface
import fs from "node:fs/promises";

export default class Storage {
  dirpath: string;
  constructor(dirpath: string) {
    this.setDirpath(dirpath);
  }

  async setDirpath(dirpath: string) {
    this.dirpath = dirpath;
    await fs.mkdir(this.dirpath, { recursive: true });
  }

  // Simple representation for storing texts
  format(str: string) {
    const now = new Date();
    return now.toLocaleString() + "\n" + str + "\r\n\r\n";
  }

  // TODO: Refactor this into a seperate date utility module
  format_as_date_string(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async save(value: string): Promise<void> {
    const now = new Date();
    console.log("File", `${this.dirpath}/${this.format_as_date_string(now)}`);
    await fs.appendFile(
      `${this.dirpath}/${this.format_as_date_string(now)}`,
      this.format(value),
    );
  }
}

// const storage = new Storage("/tmp/storage");
// console.log(storage.save("Hello world"));
// console.log(storage.save("Hi world"));
// // storage.write("hello world");
