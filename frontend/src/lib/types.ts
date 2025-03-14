export type MaybePromise<T> = T | Promise<T>;

export interface FormProps {
  unmount: () => MaybePromise<void>;
  onCancel?: () => MaybePromise<void>;
}

export interface ModalProps {
  unmount: () => MaybePromise<void>;
  onOkay?: () => MaybePromise<void>;
}

export interface ConfirmationModalProps {
  unmount: () => MaybePromise<void>;
  onYes: () => MaybePromise<void>;
  onNo?: () => MaybePromise<void>;
}

export interface ToastItem {
  message: string;
  type: 'success' | 'error' | 'warning' | 'generic';
  link?: string;
}
