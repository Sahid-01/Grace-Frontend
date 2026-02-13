import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import type { Toast } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50/95 border-green-200 text-green-800";
      case "error":
        return "bg-red-50/95 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50/95 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50/95 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50/95 border-gray-200 text-gray-800";
    }
  };

  const getToastIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />;
      case "error":
        return <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />;
      case "info":
        return <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />;
      default:
        return <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-xl backdrop-blur-sm border animate-slide-in ${getToastStyles(toast.type)}`}
          >
            {getToastIcon(toast.type)}
            <p className="flex-1 text-sm font-medium break-words">
              {toast.message}
            </p>
            <button
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 p-0.5 hover:bg-black/10 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
