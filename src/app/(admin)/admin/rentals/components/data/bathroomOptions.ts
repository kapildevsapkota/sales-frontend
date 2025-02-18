export const bathroomOptions = [
  {
    value: "1",
    label: "1 Bathroom",
  },
  {
    value: "1.5",
    label: "1.5 Bathrooms",
  },
  {
    value: "2",
    label: "2 Bathrooms",
  },
  {
    value: "2.5",
    label: "2.5 Bathrooms",
  },
  {
    value: "3",
    label: "3 Bathrooms",
  },
  {
    value: "3.5",
    label: "3.5 Bathrooms",
  },
  {
    value: "4+",
    label: "4+ Bathrooms",
  },
] as const;

export type BathroomOption = (typeof bathroomOptions)[number]["value"];
