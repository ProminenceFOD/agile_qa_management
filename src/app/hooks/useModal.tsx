import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'success' | 'error';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
  });

  const showAlert = (message: string, title: string = 'Alert') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'alert',
      confirmText: 'OK',
    });
  };

  const showSuccess = (message: string, title: string = 'Success') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'success',
      confirmText: 'OK',
    });
  };

  const showError = (message: string, title: string = 'Error') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'error',
      confirmText: 'OK',
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title: string = 'Confirm',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeModal = () => {
    setModalState({
      ...modalState,
      isOpen: false,
    });
  };

  return {
    modalState,
    showAlert,
    showSuccess,
    showError,
    showConfirm,
    closeModal,
  };
}
