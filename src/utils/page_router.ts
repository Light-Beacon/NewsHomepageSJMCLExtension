import type { ExtensionFactoryApi } from "../types/sjmcl";

export function navigate(api: ExtensionFactoryApi, path: string, args?: Record<string, string>) {
    const host = api.getHostContext();
    if (args) {
        path += path.includes("?") ? "&" : "?";
        path += new URLSearchParams(args).toString();
    }
    host.actions.navigate(path);
}