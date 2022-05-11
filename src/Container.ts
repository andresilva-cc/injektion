/* eslint-disable new-cap */

import { ReflectionClass } from 'reflection-function';
import DependencyType from './DependencyType';
import ClassFinder from './ClassFinder';
import Dependency, { Instructions } from './Dependency';

/**
 *
 *
 * @class Container
 */
class Container {
  private static dependencies: Record<string, Dependency> = {};

  /**
   * Automatically load dependencies based on a given path
   *
   * @param {string} baseDirectory Base directory to look for dependencies
   * @param {boolean} [replace=false] Whether to replace binded dependencies
   * @returns {Promise<void>} A promise that resolves when the autoload is complete
   * @memberof Container
   */
  public static async autoload(baseDirectory: string, replace = false): Promise<void> {
    const dependencies = await ClassFinder.find(baseDirectory);

    dependencies.forEach((dependency) => {
      const { name } = new ReflectionClass(dependency);
      const normalizedName = Container.normalize(name);

      if (replace || !this.has(normalizedName)) {
        this.bind(dependency);
      }
    });
  }

  /**
   * Bind a dependency
   *
   * @param {Function} reference Reference to the dependency
   * @memberof Container
   */
  public static bind(reference: Function): void {
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
  public static namedBind(name: string, reference: Function): void {
    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Normal,
      reference: reference as typeof Function,
      resolved: false,
    };
  }

  /**
   * Bind a dependency as a singleton
   *
   * @param {Function} reference Reference to the dependency
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
   * Bind a dependency to a given instance
   *
   * @static
   * @param {Function} reference Reference to the dependency
   * @param {*} instance Object instance
   * @memberof Container
   */
  public static instance(reference: Function, instance: any): void {
    const { name } = new ReflectionClass(reference);

    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      type: DependencyType.Singleton,
      reference: reference as typeof Function,
      instance,
      resolved: true,
    };
  }

  public static instructions(name: string, instructions: Instructions): void {
    const normalizedName = Container.normalize(name);

    this.dependencies[normalizedName] = {
      reference: Function,
      type: DependencyType.Normal,
      instructions,
      resolved: true,

    };
  }

  /**
   * Get a dependency from the container and recursively resolve its dependencies
   *
   * @template T Type of the dependency
   * @param {string} name Name of the dependency
   * @returns {T} Resolved dependency
   * @memberof Container
   */
  public static get<T>(name: string): T {
    const normalizedName = Container.normalize(name);

    if (!this.has(normalizedName)) {
      throw new Error(`Couldn't find dependency ${normalizedName} in the container`);
    }

    if (!this.isDependencyResolved(normalizedName)) {
      this.resolve(normalizedName);
    }

    if (this.dependencies[normalizedName].type === DependencyType.Normal) {
      return this.dependencies[normalizedName].instructions?.call(this, this);
    }

    return this.dependencies[normalizedName].instance;
  }

  /**
   * Recursively resolve a class dependencies
   *
   * @private
   * @static
   * @param {string} name Name of the dependency
   * @memberof Container
   */
  private static resolve(name: string): void {
    const { classConstructor } = new ReflectionClass(this.dependencies[name].reference);

    const resolvedDependencies: Array<any> = [];

    for (let i = 0; i < classConstructor.parameters.length; i += 1) {
      const { name: parameterName } = classConstructor.parameters[i];
      const normalizedParameterName = Container.normalize(parameterName);

      if (!this.isDependencyResolved(normalizedParameterName)) {
        this.resolve(normalizedParameterName);
      }

      resolvedDependencies.push(normalizedParameterName);
    }

    this.dependencies[name].instructions = () => (
      new this.dependencies[name].reference(
        ...resolvedDependencies.map((dependencyName: string) => {
          if (this.dependencies[dependencyName].type === DependencyType.Normal) {
            return this.dependencies[dependencyName].instructions?.call(this, this);
          }

          return this.dependencies[dependencyName].instance;
        }),
      )
    );

    if (this.dependencies[name].type === DependencyType.Singleton) {
      this.dependencies[name].instance = this.dependencies[name].instructions?.call(this, this);
    }

    this.dependencies[name].resolved = true;
  }

  /**
   * Normalize a dependency name
   *
   * @private
   * @static
   * @param {string} name Dependency name
   * @returns {string} Normalized dependency name
   * @memberof Container
   */
  private static normalize(name: string): string {
    return name.toLowerCase().replace(/[_-]/g, '');
  }

  /**
   * Check if a dependency exists in the container
   *
   * @param {string} name Name of the dependency
   * @returns {boolean} True if the dependency exists, false if not
   * @memberof Container
   */
  public static has(name: string): boolean {
    const normalizedName = Container.normalize(name);

    return !!this.dependencies[normalizedName];
  }

  /**
   * Check if a dependency is resolved
   *
   * @private
   * @static
   * @param {string} name Name of the dependency
   * @returns {boolean} True if the dependency is resolved, false if not
   * @memberof Container
   */
  private static isDependencyResolved(name: string): boolean {
    if (!this.has(name)) {
      throw new Error(`Couldn't find dependency ${name} in the container`);
    }

    return this.dependencies[name].resolved;
  }
}

export default Container;
