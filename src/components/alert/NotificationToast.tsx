import { useEffect } from "react";
import {
  X as XMarkIcon, // Equivalent to XMarkIcon
  CheckCircle as CheckCircleIcon,
  AlertCircle as ExclamationCircleIcon // Equivalent to ExclamationCircleIcon
} from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";

type Props = {
  show: boolean;
  type: NotificationType;
  message: string;
  onClose: () => void;
};

const NotificationToast = ({ show, type, message, onClose }: Props) => {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === "success" ? "bg-green-100" : type === "error" ? "bg-red-100" : type === "info" ? "bg-blue-100" : "bg-yellow-100";
  const textColor = type === "success" ? "text-green-800" : type === "error" ? "text-red-800" : type === "info" ? "text-blue-800" : "text-yellow-800";
  const Icon = type === "success" ? CheckCircleIcon : type === "error" ? ExclamationCircleIcon : type === "info" ? CheckCircleIcon : ExclamationCircleIcon;

  return (
    <div className={`relative shadow-lg rounded-md px-4 py-3 flex items-start gap-3 w-full max-w-lg ${bgColor} border`}>
      <Icon className={`w-6 h-6 mt-1 ${textColor}`} />
      <div className={`flex-1 ${textColor} text-sm`}>{message}</div>
      <button onClick={onClose} className={`${textColor} hover:opacity-70`}>
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NotificationToast;
