export type MaybePromise<T> = T | Promise<T>;

export interface FormProps {
  unmount: () => MaybePromise<void>;
}
