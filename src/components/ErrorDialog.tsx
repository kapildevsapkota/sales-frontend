import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  message,
  onClose,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="z-[99999] max-w-sm bg-white border border-gray-200 shadow-xl rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-gray-900">
            Error
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-700">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
