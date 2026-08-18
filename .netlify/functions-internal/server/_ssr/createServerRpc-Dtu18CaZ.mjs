import { i as TSS_SERVER_FUNCTION } from "./createServerFn-Dp-V928M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createServerRpc-Dtu18CaZ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
export { createServerRpc as t };
