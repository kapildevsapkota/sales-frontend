export interface FranchiseDayData {
  date: string;
  count: number;
}

export interface FranchiseDaysResponse {
  franchise_id: number;
  days: FranchiseDayData[];
}

export interface FranchiseDayDataWithDate {
  date: Date | string;
  count: number;
}

export interface FranchiseDaysResponseWithDate {
  franchise_id: number;
  days: FranchiseDayDataWithDate[];
}
