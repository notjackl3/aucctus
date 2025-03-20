export * from './api';

/**
 * Creates a type that makes all properties optional except for the specified keys K.
 * @template T - The original type
 * @template K - The keys that should remain required
 * @example
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * // Makes name and email optional, but id remains required
 * type PartialUser = AtLeast<User, 'id'>;
 */
export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Creates a new type by filtering out all function properties from the original type.
 * @template T - The original type
 * @example
 * interface Store {
 *   count: number;
 *   items: string[];
 *   increment: () => void;
 *   addItem: (item: string) => void;
 * }
 *
 * // Results in { count: number; items: string[]; }
 * type StateOnly = NonFunctionProperties<Store>;
 */
export type NonFunctionProperties<T> = {
  [P in keyof T as T[P] extends (...args: any[]) => any ? never : P]: T[P];
};

declare module '@components/*' {
  const value: any;
  export default value;
}

declare module '@pages/*' {
  const value: any;
  export default value;
}

declare module '@routes/*' {
  const value: any;
  export default value;
}

declare module '@libs/*' {
  const value: any;
  export default value;
}
