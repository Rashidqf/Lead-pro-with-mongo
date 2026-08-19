import { c as createServerFn } from "./createServerFn-aZmUlApV.mjs";
import { t as createServerRpc } from "./createServerRpc-6Gzy-5qc.mjs";
import { t as requireAuth } from "./auth-middleware-Dmg-8ydN.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { c as userHasOnlineDevice, o as requestOutboundCall } from "./companion.server-BVD9W4MC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/call.functions-Dxfin8X2.js
var requestCall_createServerFn_handler = createServerRpc({
	id: "af8d5ce532265c5057354b6e9faf5d4e36b9d95278dfabe4cfce3f532a6f53c4",
	name: "requestCall",
	filename: "src/lib/call.functions.ts"
}, (opts) => requestCall.__executeServer(opts));
var requestCall = createServerFn({ method: "POST" }).middleware([requireAuth]).inputValidator((input) => objectType({ contactId: stringType().min(1) }).parse(input)).handler(requestCall_createServerFn_handler, async ({ data, context }) => requestOutboundCall(context, data.contactId));
var callDeviceStatus_createServerFn_handler = createServerRpc({
	id: "ac4e13da8e4968eec30692cc7389ec4f751b4b97f5a9e5e6fe119142099dd7aa",
	name: "callDeviceStatus",
	filename: "src/lib/call.functions.ts"
}, (opts) => callDeviceStatus.__executeServer(opts));
var callDeviceStatus = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(callDeviceStatus_createServerFn_handler, async ({ context }) => {
	return { online: await userHasOnlineDevice(context.userId) };
});
//#endregion
export { callDeviceStatus_createServerFn_handler, requestCall_createServerFn_handler };
