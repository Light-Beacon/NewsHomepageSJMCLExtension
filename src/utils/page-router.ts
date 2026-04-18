import type { ExtensionFactoryApi } from "../types/sjmcl";

export function navigate(api: ExtensionFactoryApi, path: string, args?: Record<string, string>) {
    const host = api.getHostContext();
    path = path.startsWith("~/") ? path.replace("~/", "/extension/" + api.identifier + "/") : path;
    if (args) {
        path += path.includes("?") ? "&" : "?";
        path += new URLSearchParams(args).toString();
    }
    host.actions.logger.info("Navigating to", path);
    host.actions.navigate(path);
}