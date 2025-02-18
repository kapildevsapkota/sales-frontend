export const availabilityStatuses = [
  {
    value: "available",
    label: "Available",
  },
  {
    value: "rented",
    label: "Rented",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "maintenance",
    label: "Under Maintenance",
  },
  {
    value: "reserved",
    label: "Reserved",
  },
] as const;

export type AvailabilityStatus = (typeof availabilityStatuses)[number]["value"];
