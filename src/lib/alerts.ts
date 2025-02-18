import Swal from "sweetalert2";

type AlertOptions = {
  position?:
    | "top"
    | "top-start"
    | "top-end"
    | "center"
    | "center-start"
    | "center-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end";
  timer?: number;
  showConfirmButton?: boolean;
};

const defaultOptions: AlertOptions = {
  position: "top-end",
  timer: 3000,
  showConfirmButton: false,
};

export const showSuccess = (message: string, options: AlertOptions = {}) => {
  Swal.fire({
    icon: "success",
    title: message,
    toast: true,
    ...defaultOptions,
    ...options,
  });
};

export const showError = (message: string, options: AlertOptions = {}) => {
  Swal.fire({
    icon: "error",
    title: message,
    toast: true,
    ...defaultOptions,
    ...options,
  });
};

export const showConfirmation = async (message: string): Promise<boolean> => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });

  return result.isConfirmed;
};
