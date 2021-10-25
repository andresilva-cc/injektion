import { ReflectionClass } from 'reflection-function';
import Dependency from './Dependency';

class Container {
  private dependencies: Record<string, Dependency> = {};

  public register(reference: any): void {
    const { name } = new ReflectionClass(reference);

    const normalizedName = Container.normalize(name);

    if (this.has(normalizedName)) {
      throw new Error(`Dependency ${normalizedName} is already registered.`);
    }

    this.dependencies[normalizedName] = {
      reference,
      resolved: false,
    };
  }

  public bind(interfaceName: string, reference: any): void {
    const normalizedName = Container.normalize(interfaceName);

    if (this.has(normalizedName)) {
      throw new Error(`Dependency ${normalizedName} is already registered.`);
    }

    this.dependencies[normalizedName] = {
      reference,
      resolved: false,
    };
  }

  public get<T>(key: string): T {
    const normalizedKey = Container.normalize(key);

    if (!this.has(normalizedKey)) {
      throw new Error(`Couldn't find dependency ${normalizedKey} in the container`);
    }

    if (!this.isDependencyResolved(normalizedKey)) {
      this.resolve(normalizedKey);
    }

    return this.dependencies[normalizedKey].value;
  }

  private resolve(key: string): any {
    const { classConstructor } = new ReflectionClass(this.dependencies[key].reference);

    const resolvedDependencies = [];

    // Resolve dependencies of this key
    for (let i = 0; i < classConstructor.parameters.length; i += 1) {
      const { name } = classConstructor.parameters[i];
      const normalizedName = Container.normalize(name);

      if (this.isDependencyResolved(normalizedName)) {
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

  private static normalize(string: string): string {
    return string.toLowerCase().replace(/[_-]/g, '');
  }

  public has(key: string): boolean {
    const normalizedKey = Container.normalize(key);

    return !!this.dependencies[normalizedKey];
  }

  private isDependencyResolved(key: string): boolean {
    return this.dependencies[key].resolved;
  }
}

export default Container;
