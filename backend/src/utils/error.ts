import * as v from 'valibot';

class UnknownError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(`Unknown error: ${message}`, options);
  }
}

export function unknownError(description: string) {
  /**
   * @throws {UnknownError}
   */
  return (err: any): never => {
    throw new UnknownError(description, {
      cause: err
    });
  };
}

class ValidationError extends Error {
  constructor(message: string, key: string, issue: string, options?: ErrorOptions) {
    super(`${message}. Validation error for \'${key}\': ${issue}`, options);
  }
}

export function validationError(description: string, item: string) {
  /**
   * @throws {ValidationError|UnknownError}
   */
  return (err: any): never => {
    const options: ErrorOptions = { cause: err };

    if (v.isValiError(err)) {
      const flattened = v.flatten(err.issues);
      
      if (flattened.root) {
        throw new ValidationError(description, item, flattened.root[0], options);
      } else if (flattened.nested) {
        const [key, issues] = Object.entries(flattened.nested)[0];
        throw new ValidationError(description, `${item}.${key}`, issues?.[0] ?? '', options);
      }
    }

    throw new UnknownError(`Attempted to parse a validation error but received an unknown error instead`, options);
  }
}
