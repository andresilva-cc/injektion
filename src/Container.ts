/* eslint-disable new-cap */

import { ReflectionClass } from 'reflection-function';
import ContainerOptions from './ContainerOptions';
import DependencyType from './DependencyType';
import ClassFinder from './ClassFinder';
import Dependency from './Dependency';

class Container {
  private dependencies: Record<string, Dependency> = {};

  constructor(
    private options: ContainerOptions,
  ) {}

  public async autoload(): Promise<void> {
    const dependencies = await ClassFinder.find(this.options.autoloadBaseDir);

    dependencies.forEach((dependency) => {
      this.register(dependency);
    });
  }

  public register(reference: Function): void {
    const { name } = new ReflectionClass(reference);

    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Normal,
      reference: reference as typeof Function,
      resolved: false,
    };
  }

  public bind(name: string, reference: Function): void {
    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Normal,
      reference: reference as typeof Function,
      resolved: false,
    };
  }

  public singleton(reference: any): void {
    const { name } = new ReflectionClass(reference);

    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Singleton,
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

    if (this.dependencies[normalizedKey].type === DependencyType.Normal) {
      return this.dependencies[normalizedKey].instructions?.call(this);
    }

    return this.dependencies[normalizedKey].instance;
  }

  private resolve(key: string): any {
    const { classConstructor } = new ReflectionClass(this.dependencies[key].reference);

    const resolvedDependencies: Array<any> = [];

    for (let i = 0; i < classConstructor.parameters.length; i += 1) {
      const { name } = classConstructor.parameters[i];
      const normalizedName = Container.normalize(name);

      if (!this.isDependencyResolved(normalizedName)) {
        resolvedDependencies.push(this.resolve(normalizedName));
      }
    }

    this.dependencies[key].instructions = () => (
      new this.dependencies[key].reference(...resolvedDependencies.map((dependency: Dependency) => {
        if (dependency.type === DependencyType.Normal) {
          return dependency.instructions?.call(this);
        }

        return dependency.instance;
      }))
    );

    if (this.dependencies[key].type === DependencyType.Singleton) {
      this.dependencies[key].instance = this.dependencies[key].instructions?.call(this);
    }

    this.dependencies[key].resolved = true;

    return this.dependencies[key];
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
