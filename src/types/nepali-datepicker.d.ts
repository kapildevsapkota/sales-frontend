declare module "@sbmdkl/nepali-datepicker-reactjs" {
  import type { FC } from "react";

  interface NepaliCalendarProps {
    language?: "ne" | "en";
    dateFormat?: string;
    className?: string;
    placeholder?: string;
    value?: string;
    defaultDate?: string;
    hideDefaultValue?: boolean;
    theme?: string;
    onChange?: (date: { bsDate: string; adDate: string }) => void;
  }

  const NepaliCalendar: FC<NepaliCalendarProps>;
  export default NepaliCalendar;
}

declare module "@sbmdkl/nepali-date-converter" {
  export function adToBs(adDate: string): string;
  export function bsToAd(bsDate: string): string;
}
