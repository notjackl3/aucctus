export class TokenStructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenStructureError';
    Object.setPrototypeOf(this, TokenStructureError.prototype);
  }
}

export class ExpiryTimeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpiryTimeNotFoundError';
    Object.setPrototypeOf(this, ExpiryTimeNotFoundError.prototype);
  }
}
