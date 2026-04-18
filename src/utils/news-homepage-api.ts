import type { ExtensionFactoryApi } from "../types/sjmcl";

const apiuri = "https://news.bugjump.net/api/v1/";

async function api_get(sjmcl_api: ExtensionFactoryApi, path: string) {
    const host = sjmcl_api.getHostContext();
    try {
        host.actions.logger.info("Requesting API", apiuri + path);
        const responseText = await host.actions.requestText(
            apiuri + path,
        );
        host.actions.logger.info("API response:", responseText);
        const response = JSON.parse(responseText);
        if (response.status !== 200) {
            throw new Error("API error: " + response.status);
        }
        return response.data;
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}

async function gernal_api_get(sjmcl_api: ExtensionFactoryApi, path: string, 
    onSuccess?: Function,
    onError?: Function ) {
    try {
        const data = await api_get(sjmcl_api, path);
        if (onSuccess) {
            onSuccess(data);
        }
        return data;
    } catch (error) {
        if (onError) {
            onError(error);
        }
        return error;
    }
}

export async function getLatestVersions(sjmcl_api: ExtensionFactoryApi,
    onSuccess?: Function, onError?: Function) {
        return gernal_api_get(sjmcl_api, "mcversion/latest/data", onSuccess, onError);
}

export async function getVersion(sjmcl_api: ExtensionFactoryApi,
    version: string, onSuccess?: Function, onError?: Function) {
        return gernal_api_get(sjmcl_api, "mcversion/version/" + version, onSuccess, onError);
}