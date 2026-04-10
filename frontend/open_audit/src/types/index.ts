export type Screen = "splash" | "login" | "register" | "home" | "calculator" | "files" | "history";
export type Role = "User" | "Admin";
 
export interface HistoryEntry {
  created_at: string;
  annualincome: number;
  calculated_old_tax: number;
  calculated_new_tax: number;
  recommendation: "Old" | "New";
  savings: number;
}
