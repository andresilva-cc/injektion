import { readdirSync } from 'fs';
import { join, resolve } from 'path';

class ClassFinder {
  public static async find(path: string): Promise<Array<Function>> {
    const absolutePath = resolve(path);

    const files = this.getFilesFromPath(absolutePath);

    const exports = await Promise.all(
      files.map((file) => (
        this.getClassesFromFile(file)
      )),
    );

    return exports.flat();
  }

  private static getFilesFromPath(path: string): Array<string> {
    const files: Array<string> = [];

    const entries = readdirSync(path, {
      withFileTypes: true,
    });

    entries.forEach((entry) => {
      if (entry.isFile()) {
        files.push(join(path, entry.name));
      }

      if (entry.isDirectory()) {
        files.push(...this.getFilesFromPath(join(path, entry.name)));
      }
    });

    return files;
  }

  private static async getClassesFromFile(path: string): Promise<Array<Function>> {
    const classes: Array<Function> = [];

    const modules = await import(path);

    Object.entries(modules).forEach(([, value]) => {
      if (typeof value === 'function') {
        classes.push(value);
      }
    });

    return classes;
  }
}

export default ClassFinder;
