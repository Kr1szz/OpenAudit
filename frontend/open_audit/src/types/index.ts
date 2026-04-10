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
export interface Receipt {
  id: number;
  vendor: string;
  amount: number;
  currency: string;
  receipt_date: string;
  category: string;
  file_path: string;
  file_type: string;
  created_at: string;
  is_flagged: boolean;
  anomaly_reasons: string[];
}