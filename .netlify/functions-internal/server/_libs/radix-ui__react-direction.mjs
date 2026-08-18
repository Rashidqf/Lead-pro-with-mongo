import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "./dnd-kit__accessibility+react.mjs";
import { s as require_jsx_runtime } from "./@radix-ui/react-collection+[...].mjs";
//#region node_modules/.pnpm/@radix-ui+react-direction@1_bcddf8dfd27f5556aeb32c84ce520d53/node_modules/@radix-ui/react-direction/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
require_jsx_runtime();
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var DirectionContext = import_react.createContext(void 0);
function useDirection(localDir) {
	const globalDir = import_react.useContext(DirectionContext);
	return localDir || globalDir || "ltr";
}
__name(useDirection, "useDirection");
//#endregion
export { useDirection as t };
