export interface State {
  id: number;
  name: string;
  abbreviation: string;
  slug: string;
  description: string;
}

export interface StatesResponse {
  count: number;
  next: null | string;
  previous: null | string;
  results: State[];
}
