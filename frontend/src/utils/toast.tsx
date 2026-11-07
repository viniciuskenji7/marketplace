import { CheckCircle2, CircleX, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

const toastStyle = {
  background: '#fffdf9',
  border: '1px solid #e1d7c6',
  color: '#28352d',
};

export function showLoadingToast(message: string) {
  return toast.loading(message, {
    icon: <LoaderCircle className="animate-spin text-primary-color" size={19} />,
    style: toastStyle,
  });
}

export function showSuccessToast(message: string, id?: string | number) {
  toast.success(message, {
    id,
    icon: <CheckCircle2 className="text-emerald-700" size={19} />,
    style: toastStyle,
  });
}

export function showErrorToast(
  message: string,
  id?: string | number,
) {
  toast.error(message, {
    id,
    icon: <CircleX className="text-red-700" size={19} />,
    style: toastStyle,
  });
}
