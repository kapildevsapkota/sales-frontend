export const bedroomOptions = [
  {
    value: "studio",
    label: "Studio",
  },
  {
    value: "1",
    label: "1 Bedroom",
  },
  {
    value: "2",
    label: "2 Bedrooms",
  },
  {
    value: "3",
    label: "3 Bedrooms",
  },
  {
    value: "4",
    label: "4 Bedrooms",
  },
  {
    value: "5+",
    label: "5+ Bedrooms",
  },
] as const;

export type BedroomOption = (typeof bedroomOptions)[number]["value"];
