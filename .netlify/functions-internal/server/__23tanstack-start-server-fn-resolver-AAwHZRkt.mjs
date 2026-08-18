//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-AAwHZRkt.js
var manifest = {
	"00249a9b9f6bbc8b62362dcbdac6089a13292adfe36597823af1aa390138865a": {
		functionName: "publicSignUp_createServerFn_handler",
		importer: () => import("./_ssr/auth.functions-DdEtKbBs.mjs")
	},
	"75454526e81445e210b3752ed6012b474b177f745b67b452ea06088e76834860": {
		functionName: "adminDeleteUser_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-B3L4mMpZ.mjs")
	},
	"9b71e5a434778dc97380077d3f09e026ed75e736a126e93db3d54f114e7e6592": {
		functionName: "adminUpdateUser_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-B3L4mMpZ.mjs")
	},
	"9e2c7b3651fdf5f47a11420a03b87a06f8054b52bbc825f423a1beeb88080ac9": {
		functionName: "adminCreateUser_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-B3L4mMpZ.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
