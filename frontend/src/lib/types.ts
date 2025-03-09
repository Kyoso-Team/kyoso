export type MaybePromise<T> = T | Promise<T>;

export interface FormProps {
  onCancel: () => MaybePromise<void>;
}

export interface ModalProps {
  onOkay: () => MaybePromise<void>;
}

export interface ConfirmationModalProps {
  onYes: () => MaybePromise<void>;
  onNo: () => MaybePromise<void>;
}
