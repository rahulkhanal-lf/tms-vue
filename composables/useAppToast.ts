import { useToast } from 'vue-toastification'

export function useAppToast() {
  const toast = useToast()

  function success(message: string) {
    toast.success(message)
  }

  function error(message: string) {
    toast.error(message)
  }

  function warning(message: string) {
    toast.warning(message)
  }

  function info(message: string) {
    toast.info(message)
  }

  return { success, error, warning, info }
}
