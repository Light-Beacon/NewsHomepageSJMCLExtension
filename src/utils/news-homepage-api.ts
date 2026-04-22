import type { ExtensionFactoryApi } from "../types/sjmcl";

const apiuri = "http://news.bugjump.net/api/v1/";

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
            throw new Error("API 返回值错误: " + response.status);
        }
        return response.data;
    } catch (error) {
        console.error("API 请求失败:", error);
        throw error;
    }
}

const cache: Record<string, unknown> = {};
async function gernal_api_get(sjmcl_api: ExtensionFactoryApi, path: string, 
    onSuccess?: Function,
    onError?: Function,
    useCache = true) {
    if (useCache && cache[path]) {
        onSuccess?.(cache[path]);
        return cache[path];
    }
    try {
        const data = await api_get(sjmcl_api, path);
        if (onSuccess) {
            onSuccess(data);
        }
        cache[path] = data;
        return data;
    } catch (error) {
        if (onError) {
            onError(error);
        }
        return error;
    }
}


export async function getLatestVersions(sjmcl_api: ExtensionFactoryApi,
    onSuccess?: Function, onError?: Function, useCache = true) {
        return gernal_api_get(sjmcl_api, "mcversion/latest/data", onSuccess, onError, useCache);
}

export async function getVersion(sjmcl_api: ExtensionFactoryApi,
    version: string, onSuccess?: Function, onError?: Function, useCache = true) {
        return gernal_api_get(sjmcl_api, "mcversion/version/" + version, onSuccess, onError, useCache);
}

export function clearCache() {
    for (const key in cache) {
        delete cache[key];
    }
}