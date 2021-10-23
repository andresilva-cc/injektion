import { ReflectionClass } from 'reflection-function';

class Container {
  private dependencies: Record<string, Dependency> = {};

  public register(key: string, reference: any): void {
    const normalizedKey = Container.normalize(key);

    if (this.dependencies[normalizedKey]) {
      throw new Error(`Dependency ${normalizedKey} is already registered.`);
    }

    this.dependencies[normalizedKey] = {
      reference,
      resolved: false,
    };
  }

  public get<T>(key: string): T {
    const normalizedKey = Container.normalize(key);

    if (!this.dependencies[normalizedKey].resolved) {
      this.resolve(normalizedKey);
    }

    return this.dependencies[normalizedKey].value;
  }

  private resolve(key: string): any {
    if (!this.dependencies[key]) {
      throw new Error(`Couldn't find dependency ${key} in the container`);
    }

    const reflected = new ReflectionClass(this.dependencies[key].reference);

    const resolvedDependencies = [];

    // Resolve dependencies of this key
    for (let i = 0; i < reflected.classConstructor.numberOfParameters; i += 1) {
      const { name } = reflected.classConstructor.parameters[i];
      const normalizedName = Container.normalize(name);

      if (this.dependencies[normalizedName].resolved) {
        return this.dependencies[normalizedName].value;
      }

      resolvedDependencies.push(this.resolve(normalizedName));
    }

    // Now create an instance of this key
    // eslint-disable-next-line new-cap
    this.dependencies[key].value = new this.dependencies[key].reference(...resolvedDependencies);
    this.dependencies[key].resolved = true;

    return this.dependencies[key].value;
  }

  private static normalize(string: string) {
    return string.toLowerCase().replace(/[_-]/g, '');
  }
}

interface Dependency {
  reference: any;
  value?: any;
  resolved: boolean;
}

export default Container;
