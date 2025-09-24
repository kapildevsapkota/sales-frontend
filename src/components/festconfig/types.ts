export interface Group {
  id: string;
  name: string;
  leader: string;
  members: string[];
  createdAt: Date;
}

export interface OptionItem {
  label: string;
  value: string;
}
