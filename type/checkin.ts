export interface CheckInDay {
  date: string;
  rewards: number;
  status: "expired" | "checked" | "available" | "coming";
}

export interface CheckInCardProps {
  playTime: number;
  rewards: number;
}
