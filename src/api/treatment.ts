import { api } from "@/lib/api";
import {
  CustomerTreatment,
  TreatmentImage,
  PaymentRecord,
  CreateCustomerPayload,
  RecordPaymentPayload,
} from "@/types/treatment";

// Fetch customer treatment list
export const getCustomerTreatments = async (
  search?: string,
  treatmentType?: string,
): Promise<CustomerTreatment[]> => {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (treatmentType) params.treatment_type = treatmentType;

  const response = await api.get<CustomerTreatment[]>(
    "/api/treatment/customers/",
    { params },
  );
  return response.data;
};

// Get single customer treatment by ID
export const getCustomerTreatmentById = async (
  id: number,
): Promise<CustomerTreatment> => {
  const response = await api.get<CustomerTreatment>(
    `/api/treatment/customers/${id}/`,
  );
  return response.data;
};

// Create customer treatment
export const createCustomerTreatment = async (
  payload: CreateCustomerPayload,
): Promise<CustomerTreatment> => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("phone_number", payload.phone_number);
  if (payload.address) formData.append("address", payload.address);
  formData.append("treatment_type", payload.treatment_type);

  if (payload.treatment_type === "package_member" && payload.package) {
    formData.append("package", payload.package);
  }
  if (payload.treatment_type === "free_service" && payload.reason) {
    formData.append("reason", payload.reason);
  }
  if (payload.total_amount !== undefined && payload.total_amount !== "") {
    formData.append("total_amount", payload.total_amount.toString());
  }
  if (payload.paid_amount !== undefined && payload.paid_amount !== "") {
    formData.append("paid_amount", payload.paid_amount.toString());
  }
  if (payload.payment_method) {
    formData.append("payment_method", payload.payment_method);
  }
  if (payload.payment_screenshot) {
    formData.append("payment_screenshot", payload.payment_screenshot);
  }

  const response = await api.post<CustomerTreatment>(
    "/api/treatment/customers/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Update customer treatment
export const updateCustomerTreatment = async (
  id: number,
  payload: Partial<CreateCustomerPayload>,
): Promise<CustomerTreatment> => {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.phone_number)
    formData.append("phone_number", payload.phone_number);
  if (payload.address !== undefined)
    formData.append("address", payload.address || "");
  if (payload.treatment_type)
    formData.append("treatment_type", payload.treatment_type);
  if (payload.package) formData.append("package", payload.package);
  if (payload.reason !== undefined)
    formData.append("reason", payload.reason || "");
  if (payload.total_amount !== undefined)
    formData.append("total_amount", payload.total_amount.toString());
  if (payload.payment_screenshot)
    formData.append("payment_screenshot", payload.payment_screenshot);

  const response = await api.patch<CustomerTreatment>(
    `/api/treatment/customers/${id}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Delete customer treatment
export const deleteCustomerTreatment = async (id: number): Promise<void> => {
  await api.delete(`/api/treatment/customers/${id}/`);
};

// Upload progress photo for periodic days (Day 1, 4, 8, 12...)
export const uploadDayProgressImage = async (
  customerTreatmentId: number,
  dayNumber: number,
  imageFile: File,
): Promise<TreatmentImage> => {
  const formData = new FormData();
  formData.append("customer_treatment", customerTreatmentId.toString());
  formData.append("day_number", dayNumber.toString());
  formData.append("image", imageFile);

  const response = await api.post<TreatmentImage>(
    "/api/treatment/images/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Delete an image
export const deleteTreatmentImage = async (imageId: number): Promise<void> => {
  await api.delete(`/api/treatment/images/${imageId}/`);
};

// Record payment
export const recordPayment = async (
  payload: RecordPaymentPayload,
): Promise<PaymentRecord> => {
  const formData = new FormData();
  formData.append("customer_treatment", payload.customer_treatment.toString());
  formData.append("amount", payload.amount.toString());
  formData.append("payment_method", payload.payment_method);
  if (payload.remarks) formData.append("remarks", payload.remarks);
  if (payload.payment_screenshot) {
    formData.append("payment_screenshot", payload.payment_screenshot);
  }

  const response = await api.post<PaymentRecord>(
    "/api/treatment/payments/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};
