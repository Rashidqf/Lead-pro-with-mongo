import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

import {
  createExpense,
  createPayment,
  createProject,
  deleteExpense,
  deletePayment,
  deleteProject,
  getContactFinanceSummary,
  getFinanceDashboard,
  getProjectProfitability,
  listExpenses,
  listPayments,
  listProjects,
  listTransactions,
  markContactConverted,
  updateExpense,
  updatePayment,
  updateProject,
} from "@/lib/finance.functions";

export type ProjectStatus = "active" | "completed" | "on_hold" | "cancelled";

export type ExpenseType = "business" | "project" | "personal";

export type ExpenseCategory =
  | "Meta Ads"
  | "Domain"
  | "Hosting"
  | "Email"
  | "Software"
  | "Marketing"
  | "Internet"
  | "Mobile"
  | "Transport"
  | "Project Cost"
  | "Personal"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Meta Ads",
  "Domain",
  "Hosting",
  "Email",
  "Software",
  "Marketing",
  "Internet",
  "Mobile",
  "Transport",
  "Project Cost",
  "Personal",
  "Other",
];

export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "JazzCash", "EasyPaisa", "Other"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Project = {
  id: string;
  contact_id: string;
  contact_phone: string | null;
  name: string;
  value: number;
  start_date: string | null;
  completion_date: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  contact_id: string;
  contact_phone: string | null;
  project_id: string | null;
  amount: number;
  date: string;
  payment_method: string;
  description: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  date: string;
  type: ExpenseType;
  category: string;
  contact_id: string | null;
  project_id: string | null;
  amount: number;
  description: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  date: string;
  type: "income" | "expense";
  contact_id: string | null;
  contact_name: string | null;
  project_id: string | null;
  project_name: string | null;
  category: string | null;
  expense_type: ExpenseType | null;
  amount: number;
  description: string | null;
  payment_method: string | null;
};

export type DateRangePreset =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "prevMonth"
  | "custom";

export type DateRange = {
  preset: DateRangePreset;
  from: string;
  to: string;
};

export type FinanceMetrics = {
  revenue: number;
  businessExpenses: number;
  netProfit: number;
  outstanding: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  personalExpenses: number;
};

export type ChartPoint = {
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export type OutstandingRow = {
  contact_id: string;
  contact_name: string;
  contact_phone: string | null;
  project_id: string;
  project_name: string;
  project_value: number;
  amount_received: number;
  amount_remaining: number;
};

export type ContactFinanceSummary = {
  total_projects: number;
  total_project_value: number;
  total_received: number;
  outstanding: number;
  project_expenses: number;
  net_profit: number;
  projects: ProjectProfitability[];
};

export type ProjectProfitability = {
  project: Project;
  amount_received: number;
  outstanding: number;
  project_expenses: number;
  estimated_profit: number;
};

export type FinanceDashboard = {
  metrics: FinanceMetrics;
  chart: ChartPoint[];
  outstanding: OutstandingRow[];
};

export function resolveDateRange(
  preset: DateRangePreset,
  customFrom?: string,
  customTo?: string,
): { from: Date; to: Date } {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "last7":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "last30":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "prevMonth": {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    case "custom": {
      const from = customFrom ? startOfDay(new Date(customFrom)) : startOfMonth(now);
      const to = customTo ? endOfDay(new Date(customTo)) : endOfDay(now);
      return { from, to };
    }
    default:
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
  }
}

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function formatDateLabel(iso: string) {
  return format(new Date(iso), "d MMM yyyy");
}

export const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  last7: "Last 7 days",
  last30: "Last 30 days",
  thisMonth: "This month",
  prevMonth: "Previous month",
  custom: "Custom range",
};

export const projectsQuery = {
  queryKey: ["projects"],
  queryFn: (): Promise<Project[]> => listProjects(),
};

export const paymentsQuery = {
  queryKey: ["payments"],
  queryFn: (): Promise<Payment[]> => listPayments(),
};

export const expensesQuery = {
  queryKey: ["expenses"],
  queryFn: (): Promise<Expense[]> => listExpenses(),
};

export function financeDashboardQuery(range: DateRange) {
  return {
    queryKey: ["finance-dashboard", range],
    queryFn: (): Promise<FinanceDashboard> =>
      getFinanceDashboard({
        data: {
          preset: range.preset,
          from: range.from,
          to: range.to,
        },
      }),
  };
}

export function transactionsQuery(range: DateRange) {
  return {
    queryKey: ["transactions", range],
    queryFn: (): Promise<Transaction[]> =>
      listTransactions({
        data: {
          preset: range.preset,
          from: range.from,
          to: range.to,
        },
      }),
  };
}

export function contactFinanceQuery(contactId: string) {
  return {
    queryKey: ["contact-finance", contactId],
    queryFn: (): Promise<ContactFinanceSummary> =>
      getContactFinanceSummary({ data: { contactId } }),
  };
}

export function projectProfitabilityQuery(projectId: string) {
  return {
    queryKey: ["project-profitability", projectId],
    queryFn: (): Promise<ProjectProfitability> =>
      getProjectProfitability({ data: { projectId } }),
  };
}

export {
  createExpense,
  createPayment,
  createProject,
  deleteExpense,
  deletePayment,
  deleteProject,
  getContactFinanceSummary,
  getFinanceDashboard,
  getProjectProfitability,
  listExpenses,
  listPayments,
  listProjects,
  listTransactions,
  markContactConverted,
  updateExpense,
  updatePayment,
  updateProject,
};
