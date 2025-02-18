export const enquiryTypes = [
  {
    value: "General Inquiry",
    label: "General Inquiry",
  },
  {
    value: "Specific Property",
    label: "Specific Property",
  },
] as const;

export type EnquiryType = (typeof enquiryTypes)[number]["value"];
