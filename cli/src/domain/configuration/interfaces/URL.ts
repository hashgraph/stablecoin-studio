export const URL_REGEX = /^(http|https):\/\/[^ "]+$/;

/**
 * Represents a URL.
 */
export default class URL {
  private value: string; // The URL value.

  constructor({ value }: { value: string }) {
    this.value = this.validateValue({ value });
  }

  /**
   * Returns the string representation of the URL.
   * @returns The URL as a string.
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Creates a new URL instance from a string.
   * @param value - The string representation of the URL.
   * @returns A new URL instance.
   */
  static fromString({ value }: { value: string }): URL {
    return new URL({ value });
  }

  /**
   * Validates if a string is a valid URL.
   * @param value - The string to validate.
   * @returns A boolean indicating if the string is a valid URL.
   */
  static validate({ value }: { value: string }): boolean {
    return URL_REGEX.test(value);
  }

  private validateValue({ value }: { value: string }): string {
    if (!URL_REGEX.test(value)) {
      throw new Error('Invalid URL format');
    }
    return value;
  }
}
