// Custom error classes for Go module proxy API

export class ModuleNotFoundError extends Error {
  readonly name = 'ModuleNotFoundError';
  readonly code = 'MODULE_NOT_FOUND';

  constructor(modulePath: string) {
    super(`Module "${modulePath}" not found. Please check the module path.`);
  }
}

export class ReleaseNotFoundError extends Error {
  readonly name = 'ReleaseNotFoundError';
  readonly code = 'RELEASE_NOT_FOUND';

  constructor(modulePath: string, release: string) {
    super(`Release "${release}" not found for module "${modulePath}".`);
  }
}
