import type { Toast } from './Toast';

export type ShowToastFn = (toast: Omit<Toast, 'id'>) => void;

let showToastFn: ShowToastFn | null = null;

export function registerToast(fn: ShowToastFn) {
  showToastFn = fn;
}

export function unregisterToast(fn: ShowToastFn) {
  if (showToastFn === fn) {
    showToastFn = null;
  }
}

export const toastService = {
  show(toast: Omit<Toast, 'id'>) {
    if (showToastFn) showToastFn(toast);
  },
};
