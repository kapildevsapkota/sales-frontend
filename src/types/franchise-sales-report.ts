export interface FranchiseSalesReportItem {
  franchise_id: number;
  franchise_name: string;
  total_sales: number;
  online_sales: number;
  office_sale: number;
  product_breakdown: Record<string, number>;
}

