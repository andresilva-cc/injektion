import { readdir } from 'fs/promises';

class ClassFinder {
  public static async find(): Promise<Array<any>> {
    try {
      const classes: Array<Function> = [];

      const files = await readdir('./src/tests/Mock', {
        withFileTypes: true,
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        console.log(`${file.isDirectory() ? 'Diretory: ' : 'File: '} ${file.name}`);

        if (file.isFile()) {
          // eslint-disable-next-line no-await-in-loop
          classes.push(...await this.importAndResolveClasses(`./tests/Mock/${file.name}`));
        }
      }

      return classes;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private static async importAndResolveClasses(path: string): Promise<Array<Function>> {
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
