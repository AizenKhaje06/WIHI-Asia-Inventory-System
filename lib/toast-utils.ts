import { toast } from "sonner"

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  })
}

export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 4000,
  })
}

export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  })
}

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 3500,
  })
}

export const showLoading = (message: string) => {
  return toast.loading(message)
}

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId)
}

export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error: string
  }
) => {
  return toast.promise(promise, messages)
}
