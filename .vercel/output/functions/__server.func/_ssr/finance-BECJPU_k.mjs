import { c as createServerFn } from "./createServerFn-aZmUlApV.mjs";
import { t as requireAuth } from "./auth-middleware-Dmg-8ydN.mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BsBAu1JQ.mjs";
import { d as startOfDay, i as format, l as endOfMonth, n as subDays, o as startOfMonth, t as subMonths, u as endOfDay } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance-BECJPU_k.js
var dateRangeInput = objectType({
	preset: enumType([
		"today",
		"last7",
		"last30",
		"thisMonth",
		"prevMonth",
		"custom"
	]),
	from: stringType().optional(),
	to: stringType().optional()
});
var listProjects = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("4bb0304f41c8281e81277b38b1078b8615220a8fa97f1777cea1f8283198245d"));
var listPayments = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("28290d0858e4134f3df52fe73369b09e414f0d63359b672cbef239b18ce50700"));
var listExpenses = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(createSsrRpc("26405da00d71dd486a845e6d1027a315631f0f02abd0c40c7fbc07db000c9ea1"));
var createProject = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	contact_id: stringType().min(1),
	name: stringType().min(1).max(200),
	value: numberType().min(0),
	start_date: stringType().nullable().optional(),
	completion_date: stringType().nullable().optional(),
	status: enumType([
		"active",
		"completed",
		"on_hold",
		"cancelled"
	]).optional()
}).parse(input)).handler(createSsrRpc("2a58f8c6733921043891a8402423833a9cae7092983cc6ded8811c918cb3f844"));
var updateProject = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	name: stringType().min(1).max(200).optional(),
	value: numberType().min(0).optional(),
	start_date: stringType().nullable().optional(),
	completion_date: stringType().nullable().optional(),
	status: enumType([
		"active",
		"completed",
		"on_hold",
		"cancelled"
	]).optional()
}).parse(input)).handler(createSsrRpc("df416e66d4c3b71a18fb35266d04d2ed5a850a9a4ff3710ba840b95c6913a294"));
var deleteProject = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(createSsrRpc("0dc9f18acecc32c439cbeeee80cb1a6d3ef032989c4cad696c98c40ea1602032"));
var createPayment = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	contact_id: stringType().min(1),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive(),
	date: stringType().min(1),
	payment_method: stringType().min(1),
	description: stringType().nullable().optional()
}).parse(input)).handler(createSsrRpc("fb1fef4ca76329789988f717fef92168676b43124c795e47eaa660df944a64a6"));
var updatePayment = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive().optional(),
	date: stringType().min(1).optional(),
	payment_method: stringType().min(1).optional(),
	description: stringType().nullable().optional()
}).parse(input)).handler(createSsrRpc("726ab7d0783e239089ea6d13b0c5f316218f508fb09f1ebfb339b501b149de25"));
var deletePayment = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(createSsrRpc("92ced228b5b714d503b9375cb435f21c8624a212dfd6571373adab4db637d28f"));
var createExpense = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	date: stringType().min(1),
	type: enumType([
		"business",
		"project",
		"personal"
	]),
	category: stringType().min(1),
	contact_id: stringType().nullable().optional(),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive(),
	description: stringType().nullable().optional()
}).parse(input)).handler(createSsrRpc("f320f928035e1a8a7eb22cfaf033a60706fbeca1bd34e48d3f9daaa73f4f4517"));
var updateExpense = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	date: stringType().min(1).optional(),
	type: enumType([
		"business",
		"project",
		"personal"
	]).optional(),
	category: stringType().min(1).optional(),
	contact_id: stringType().nullable().optional(),
	project_id: stringType().nullable().optional(),
	amount: numberType().positive().optional(),
	description: stringType().nullable().optional()
}).parse(input)).handler(createSsrRpc("f5cfc69f9e2fc42a406a8938a31ceab405237f207b5380760e178464a5d5f68d"));
var deleteExpense = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(createSsrRpc("2ee550306b8d40331de7f9821e5403d52d2bfb492d498f72ad7bca730e4f2870"));
var markContactConverted = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ contactId: stringType().min(1) }).parse(input)).handler(createSsrRpc("e9b9c0690f011aa59d5b341d20aea449594f538369c5bb75efb35992908f1fe9"));
var getFinanceDashboard = createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => dateRangeInput.parse(input)).handler(createSsrRpc("8a7f7bfa70079b98695220283f12f04aebc50e6607e2ae045f466d529ceda974"));
var listTransactions = createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => dateRangeInput.parse(input)).handler(createSsrRpc("949c32252a4b5e67ed596eeca541fdf737e3f11f1bd672fd59b94e04314d5306"));
var getContactFinanceSummary = createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => objectType({ contactId: stringType().min(1) }).parse(input)).handler(createSsrRpc("83c1b2b27dc5957a281e1637d485671d6b72ddea44ba5e9658495d61c1757ea8"));
createServerFn({ method: "GET" }).middleware([requireAuth]).inputValidator((input) => objectType({ projectId: stringType().min(1) }).parse(input)).handler(createSsrRpc("430f104bc6351d9d9646a3d1424ee071da61bd8b51689b795e71bc52754708e1"));
var EXPENSE_CATEGORIES = [
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
	"Other"
];
var PAYMENT_METHODS = [
	"Cash",
	"Bank Transfer",
	"JazzCash",
	"EasyPaisa",
	"Other"
];
function resolveDateRange(preset, customFrom, customTo) {
	const now = /* @__PURE__ */ new Date();
	switch (preset) {
		case "today": return {
			from: startOfDay(now),
			to: endOfDay(now)
		};
		case "last7": return {
			from: startOfDay(subDays(now, 6)),
			to: endOfDay(now)
		};
		case "last30": return {
			from: startOfDay(subDays(now, 29)),
			to: endOfDay(now)
		};
		case "thisMonth": return {
			from: startOfMonth(now),
			to: endOfDay(now)
		};
		case "prevMonth": {
			const prev = subMonths(now, 1);
			return {
				from: startOfMonth(prev),
				to: endOfMonth(prev)
			};
		}
		case "custom": return {
			from: customFrom ? startOfDay(new Date(customFrom)) : startOfMonth(now),
			to: customTo ? endOfDay(new Date(customTo)) : endOfDay(now)
		};
		default: return {
			from: startOfDay(subDays(now, 29)),
			to: endOfDay(now)
		};
	}
}
function formatCurrency(amount) {
	return `Rs. ${amount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
function formatDateLabel(iso) {
	return format(new Date(iso), "d MMM yyyy");
}
var DATE_RANGE_LABELS = {
	today: "Today",
	last7: "Last 7 days",
	last30: "Last 30 days",
	thisMonth: "This month",
	prevMonth: "Previous month",
	custom: "Custom range"
};
var projectsQuery = {
	queryKey: ["projects"],
	queryFn: () => listProjects()
};
var paymentsQuery = {
	queryKey: ["payments"],
	queryFn: () => listPayments()
};
var expensesQuery = {
	queryKey: ["expenses"],
	queryFn: () => listExpenses()
};
function financeDashboardQuery(range) {
	return {
		queryKey: ["finance-dashboard", range],
		queryFn: () => getFinanceDashboard({ data: {
			preset: range.preset,
			from: range.from,
			to: range.to
		} })
	};
}
function transactionsQuery(range) {
	return {
		queryKey: ["transactions", range],
		queryFn: () => listTransactions({ data: {
			preset: range.preset,
			from: range.from,
			to: range.to
		} })
	};
}
function contactFinanceQuery(contactId) {
	return {
		queryKey: ["contact-finance", contactId],
		queryFn: () => getContactFinanceSummary({ data: { contactId } })
	};
}
//#endregion
export { updateProject as S, projectsQuery as _, createExpense as a, updateExpense as b, deleteExpense as c, expensesQuery as d, financeDashboardQuery as f, paymentsQuery as g, markContactConverted as h, contactFinanceQuery as i, deletePayment as l, formatDateLabel as m, EXPENSE_CATEGORIES as n, createPayment as o, formatCurrency as p, PAYMENT_METHODS as r, createProject as s, DATE_RANGE_LABELS as t, deleteProject as u, resolveDateRange as v, updatePayment as x, transactionsQuery as y };
