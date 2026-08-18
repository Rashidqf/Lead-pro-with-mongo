import {
  listActivities,
  listColumns,
  listContacts,
  listProfiles,
  listRoles,
} from "@/lib/crm.functions";

export type BoardColumn = {
  id: string;
  name: string;
  position: number;
  color: string;
};

export type Contact = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  last_activity_date: string | null;
  last_message: string | null;
  column_id: string | null;
  assigned_to: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
};

export type Activity = {
  id: string;
  contact_id: string | null;
  user_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
};

export const columnsQuery = {
  queryKey: ["board-columns"],
  queryFn: (): Promise<BoardColumn[]> => listColumns(),
};

export const contactsQuery = {
  queryKey: ["contacts"],
  queryFn: (): Promise<Contact[]> => listContacts(),
};

export const profilesQuery = {
  queryKey: ["profiles"],
  queryFn: (): Promise<Profile[]> => listProfiles(),
};

export const rolesQuery = {
  queryKey: ["user-roles"],
  queryFn: (): Promise<{ user_id: string; role: "admin" | "user" }[]> => listRoles(),
};

export const activitiesQuery = {
  queryKey: ["activities"],
  queryFn: (): Promise<Activity[]> => listActivities(),
};

export function displayName(profile?: Profile | null) {
  if (!profile) return "Unassigned";
  return profile.full_name || profile.email || "Unknown user";
}

export function initials(value: string) {
  const clean = value.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
