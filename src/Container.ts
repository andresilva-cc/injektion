/* eslint-disable new-cap */

import { ReflectionClass } from 'reflection-function';
import DependencyType from './DependencyType';
import ClassFinder from './ClassFinder';
import Dependency from './Dependency';

class Container {
  private static dependencies: Record<string, Dependency> = {};

  /**
   * Automatically load dependencies based on a given path
   *
   * @param {string} baseDirectory Base directory to look for dependencies
   * @returns {Promise<void>} A promise that resolves when the autoload is complete
   * @memberof Container
   */
  public static async autoload(baseDirectory: string): Promise<void> {
    const dependencies = await ClassFinder.find(baseDirectory);

    dependencies.forEach((dependency) => {
      this.register(dependency);
    });
  }

  /**
   * Manually register a dependency
   *
   * @param {Function} reference Reference to the dependency
   * @memberof Container
   */
  public static register(reference: Function): void {
    const { name } = new ReflectionClass(reference);

    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Normal,
      reference: reference as typeof Function,
      resolved: false,
    };
  }

  /**
   * Bind a custom name to a dependency
   *
   * Since JavaScript has no interfaces, this method can be used to simulate the binding of an
   * interface to a concrete class. Just provide a name like 'UserRepository' and bind it to a class
   * like 'SequelizeUserRepository'
   *
   * @param {string} name Custom name to bind to
   * @param {Function} reference Reference to the dependency
   * @memberof Container
   */
  public static bind(name: string, reference: Function): void {
    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Normal,
      reference: reference as typeof Function,
      resolved: false,
    };
  }

  /**
   * Register a dependency as a singleton
   *
   * @param {*} reference Reference to the dependency
   * @memberof Container
   */
  public static singleton(reference: Function): void {
    const { name } = new ReflectionClass(reference);

    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Singleton,
      reference: reference as typeof Function,
      resolved: false,
    };
  }

  /**
   * Get a dependency from the container and recursively resolve its dependencies
   *
   * @template T Type of the dependency
   * @param {string} key Key of the dependency
   * @returns {T} Resolved dependency
   * @memberof Container
   */
  public static get<T>(key: string): T {
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

  private static resolve(key: string): void {
    const { classConstructor } = new ReflectionClass(this.dependencies[key].reference);

    const resolvedDependencies: Array<any> = [];

    for (let i = 0; i < classConstructor.parameters.length; i += 1) {
      const { name } = classConstructor.parameters[i];
      const normalizedName = Container.normalize(name);

      if (!this.isDependencyResolved(normalizedName)) {
        this.resolve(normalizedName);
      }

      resolvedDependencies.push(normalizedName);
    }

    this.dependencies[key].instructions = () => (
      new this.dependencies[key].reference(...resolvedDependencies.map((dependencyKey: string) => {
        if (this.dependencies[dependencyKey].type === DependencyType.Normal) {
          return this.dependencies[dependencyKey].instructions?.call(this);
        }

        return this.dependencies[dependencyKey].instance;
      }))
    );

    if (this.dependencies[key].type === DependencyType.Singleton) {
      this.dependencies[key].instance = this.dependencies[key].instructions?.call(this);
    }

    this.dependencies[key].resolved = true;
  }

  private static normalize(string: string): string {
    return string.toLowerCase().replace(/[_-]/g, '');
  }

  /**
   * Check if a dependency exists in the container
   *
   * @param {string} key Key of the dependency
   * @returns {boolean} True if the dependency exists, false if not
   * @memberof Container
   */
  public static has(key: string): boolean {
    const normalizedKey = Container.normalize(key);

    return !!this.dependencies[normalizedKey];
  }

  private static isDependencyResolved(key: string): boolean {
    if (!this.has(key)) {
      throw new Error(`Couldn't find dependency ${key} in the container`);
    }

    return this.dependencies[key].resolved;
  }
}

export default Container;
