export {};

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Ensures that `value >= expected`.
       *
       * @param expected The value to compare to
       * @param options.timeout Timeout in milliseconds for the assertion to be fulfilled
       */
      toHaveCountGreaterThanOrEqual(expected: number, options?: { timeout?: number }): Promise<R>;

      /**
       * Ensures that `value > expected`.
       *
       * @param expected The value to compare to
       * @param options.timeout Timeout in milliseconds for the assertion to be fulfilled
       */
      toHaveCountGreaterThan(expected: number, options?: { timeout?: number }): Promise<R>;

      /**
       * Ensures that `value <= expected`.
       *
       * @param expected The value to compare to
       * @param options.timeout Timeout in milliseconds for the assertion to be fulfilled
       */
      toHaveCountLessThanOrEqual(expected: number, options?: { timeout?: number }): Promise<R>;

      /**
       * Ensures that `value < expected`.
       *
       * @param expected The value to compare to
       * @param options.timeout Timeout in milliseconds for the assertion to be fulfilled
       */
      toHaveCountLessThan(expected: number, options?: { timeout?: number }): Promise<R>;
    }
  }
}
