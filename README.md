# Injektion

Decorator-less dependency injection for JavaScript and TypeScript.

**NOTE: This project is in early development, so expect bugs and missing features. Any help would be appreciated :)**

## Why?

I've tried several dependency injection frameworks for JavaScript and TypeScript. There are two main things I didn't like about them:

1. Decorators
2. Too much manual configuration

So I've started thinking about how a new dependency injection framework could be better.

First of all, I need to somehow get information about a specific class, like its name and constructor parameters. It turns out that JavaScript doesn't have a built-in Reflection API for that kind of task. So that's why they use [reflect-metadata](https://github.com/rbuckton/reflect-metadata).

So I've created my own reflection package: [reflection-function](https://github.com/andresilva-cc/reflection-function). Now I can get all those information from a function and a class.

But there's still a problem here: JavaScript doesn't have types. Even TypeScript doesn't have types at runtime or after the code has been compiled. How am I gonna know which dependency I have to inject if there's no information about types?

Well, the only thing that I have left is the parameter name. So that's what I'm going to use. Dependency injections are made based on the parameter name. For example, if you have a class named `UserService` and you need to inject it in another class constructor, you would name the parameter `userService`, or maybe `user_service` (the letter case is up to you).

Ok, now we have dependency injection without decorators. But what about "too much manual configuration"?

That's simple. I wrote a class that goes through all your project files and dynamically imports them (with `import()`). It works with default and named exports and it only imports classes. Those imports are stored in the dependency container and are available to use with zero configuration.

Of course, that works only for concrete classes. As in Laravel's service container, if your class depends on interfaces, you need to manually bind the interface to the concrete class. Well, while TypeScript does have interfaces, JavaScript doesn't, so in the end interfaces doesn't even exist at all, so you just manually bind a name, like `UserRepository` to a real object, like `SequelizeUserRepository`.

## Setup

Install the package with: 

```bash
npm install injektion
```

Create a file somewhere in your project to store your manual bindings, like for example a `./src/config/dependencies.ts` with this content:

```typescript
import { Container } from 'injektion';
import {
  SequelizeUserActivationRepository, SequelizeUserRepository,
} from './app/Repositories/Implementation';

export default () => {
  Container.bind('UserRepository', SequelizeUserRepository);
  Container.bind('UserActivationRepository', SequelizeUserActivationRepository);
};
```

Somewhere where your application starts, run the default export of the file you just created (to bind the dependencies) and the `autoload` method from the container to automatically load the dependencies based on the base path you provided:

```typescript
import { Container } from 'injektion';
import bindDependencies from './config/dependencies.ts';

// ...

bindDependencies();
await Container.autoload('./src/app');
```

## Usage

To start resolving the dependencies, an entry point is needed. For example, if you have the dependency structure `AuthController <- AuthService <- UserRepository`, you would call the `get` method from the container, requesting the `AuthController`, and each dependency is recursively resolved:

```typescript
import { Container } from 'injektion';

// ...

const authController = <AuthController>Container.get('AuthController');
```

Ensure that all of your constructor parameters have the same name as the class you want to inject. For example, if you want to inject a class named `AuthService`, name the parameter `authService` or in any case you want, like `auth_service`. The case is not important, the name itself is.

Check the **API** section below for more info.

## API

### Autoloading dependencies

```typescript
Container.autoload(baseDirectory: string): Promise<void>;

// Example
await Container.autoload('./src/app');
```

### Manually registering a dependency

```typescript
Container.register(reference: Function): void;

// Example
import { AuthController } from './app/Controllers';

Container.register(AuthController)
```

### Binding an interface (name) to a class

```typescript
Container.bind(name: string, reference: Function): void;

// Example
import { SequelizeUserRepository } from './app/Repositories/Implementation';

Container.bind('UserRepository', SequelizeUserRepository)
```

### Registering a dependency as a Singleton

```typescript
Container.singleton(reference: any): void;

// Example
import { AuthService } from './app/Services';

Container.singleton(AuthService);
```

### Getting a dependency from the container and recursively resolving its dependencies

```typescript
Container.get<T>(key: string): T;

// Example
import { MailFacade } from './app/Facades';

const mailFacade = <MailFacade>Container.get('MailFacade');
```

### Checking if a dependency exists in the container

```typescript
Container.has(key: string): boolean;

// Example
const exists = Container.has('ActivationService');
```

## Development

Install the dependencies:

```bash
npm install
```

All source codes are located in the `src` directory.

### Testing

To run the tests, run in your terminal:

```bash
npm run test
```

To check the code coverage, run in your terminal:

```bash
npm run coverage
```

And then open in the browser the file `coverage/lcov-report/index.html`.

### Building

To build the package, run:

```bash
npm run build
```

The generated JavaScript code is located in the `dist` directory.



