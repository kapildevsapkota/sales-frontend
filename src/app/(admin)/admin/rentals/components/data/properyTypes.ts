export const propertyTypes = [
  {
    value: "Single Family",
    label: "Single Family",
  },
  {
    value: "Condominium",
    label: "Condominium",
  },
  {
    value: "Townhouse",
    label: "Townhouse",
  },
  {
    value: "Duplex",
    label: "Duplex",
  },
  {
    value: "Other",
    label: "Other",
  },
] as const;

export type PropertyType = (typeof propertyTypes)[number]["value"];
