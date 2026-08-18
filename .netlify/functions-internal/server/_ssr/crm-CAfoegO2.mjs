import { t as supabase } from "./client-BzZDn2SK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crm-CAfoegO2.js
var columnsQuery = {
	queryKey: ["board-columns"],
	queryFn: async () => {
		const { data, error } = await supabase.from("board_columns").select("*").order("position", { ascending: true });
		if (error) throw error;
		return data ?? [];
	}
};
var contactsQuery = {
	queryKey: ["contacts"],
	queryFn: async () => {
		const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(5e3);
		if (error) throw error;
		return data ?? [];
	}
};
var profilesQuery = {
	queryKey: ["profiles"],
	queryFn: async () => {
		const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
		if (error) throw error;
		return data ?? [];
	}
};
var rolesQuery = {
	queryKey: ["user-roles"],
	queryFn: async () => {
		const { data, error } = await supabase.from("user_roles").select("user_id, role");
		if (error) throw error;
		return data ?? [];
	}
};
var activitiesQuery = {
	queryKey: ["activities"],
	queryFn: async () => {
		const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(25);
		if (error) throw error;
		return data ?? [];
	}
};
async function logActivity(userId, contactId, action, detail) {
	await supabase.from("activities").insert({
		user_id: userId,
		contact_id: contactId,
		action,
		detail: detail ?? null
	});
}
function displayName(profile) {
	if (!profile) return "Unassigned";
	return profile.full_name || profile.email || "Unknown user";
}
function initials(value) {
	const clean = value.replace(/[^a-zA-Z0-9 ]/g, "").trim();
	if (!clean) return "?";
	const parts = clean.split(/\s+/);
	return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
//#endregion
export { initials as a, rolesQuery as c, displayName as i, columnsQuery as n, logActivity as o, contactsQuery as r, profilesQuery as s, activitiesQuery as t };
