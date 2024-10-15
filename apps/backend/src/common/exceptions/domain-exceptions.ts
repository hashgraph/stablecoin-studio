// exceptions/domain-exceptions.ts

export class InvalidTransactionUUIDException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTransactionUUIDException';
  }
}

export class TransactionNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionNotFoundException';
  }
}

export class MessageAlreadySignedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessageAlreadySignedException';
  }
}

export class UnauthorizedKeyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedKeyException';
  }
}

export class InvalidSignatureException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSignatureException';
  }
}
