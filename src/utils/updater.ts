import type { ExtensionFactoryApi } from "../types/sjmcl";

declare const __EXT_VERSION__: string;

const UPDATE_API_URL = "https://sjmclapi.bugjump.net/releases/latest";
const CURRENT_VERSION = __EXT_VERSION__;

export function getExtensionVersion(){
    return CURRENT_VERSION;
}

export interface VersionInfo {
    id: string,
    publishTime: string,
    updateLog: string,
    downloadUrl: string | null,
}

export type UpdateState =
	| { kind: "checking" }
	| { kind: "error"; message: string }
	| { kind: "latest"; version: VersionInfo }
	| { kind: "update"; version: VersionInfo }
    | { kind: "developing"; version: VersionInfo }
    | { kind: "updating"; version: VersionInfo };


function normalizeVersion(value: unknown): string {
    if (typeof value !== "string") {
        throw Error("无法解析版本名称")
    }

    const trimmed = value.trim().replace(/^v/i, "");
    return trimmed;
}

function resolveVersion(payload: unknown): VersionInfo {
    if (!payload || typeof payload !== "object") {
        throw Error("无法解析版本")
    }
    const record = payload as Record<string, unknown>;
    const assets = record.assets as Array<Record<string, unknown>>
    let downloadUrl: string | null = null
    if (assets && assets.length > 0) {
        for (const asset of assets) {
            if( String(asset.name).endsWith('.sjmclx' )){
                downloadUrl = String(asset.browser_download_url)
                break
            }
        }
    }
    return {
        id: normalizeVersion(record.tag_name),
        publishTime: String(record.published_at),
        downloadUrl: downloadUrl,
        updateLog: String(record.body)
    }
}

function isNewerVersion(remoteVersion: string, currentVersion: string): boolean {
    const normalize = (value: string): number[] =>
        value
            .replace(/^v/i, "")
            .split(/[.-]/)
            .map((part) => {
                const numeric = Number(part);
                return Number.isFinite(numeric) ? numeric : 0;
            });

    const remoteParts = normalize(remoteVersion);
    const currentParts = normalize(currentVersion);
    const length = Math.max(remoteParts.length, currentParts.length);

    for (let i = 0; i < length; i += 1) {
        const remote = remoteParts[i] ?? 0;
        const current = currentParts[i] ?? 0;

        if (remote > current) {
            return true;
        }

        if (remote < current) {
            return false;
        }
    }

    return false;
}

var cachedLatestVersion: VersionInfo | null = null

export async function checkForUpdates(api: ExtensionFactoryApi, setState:any, useCache = false) {
    setState({ kind: "checking" });
    const host = api.getHostContext();
    try {
        if (!cachedLatestVersion || useCache){
            const responseText = await host.actions.requestText(UPDATE_API_URL);
            const payload = JSON.parse(responseText) as unknown;
            cachedLatestVersion = resolveVersion(payload);
        }
        const latestVersion = cachedLatestVersion
        
        if (!latestVersion) {
            throw new Error("无法解析最新版本号");
        }

        if (isNewerVersion(latestVersion.id, CURRENT_VERSION)) {
            setState({ kind: "update", version: latestVersion });
            return;
        }

        if (isNewerVersion(CURRENT_VERSION, latestVersion.id, )) {
            setState({ kind: "developing", version: latestVersion });
            return;
        }

        setState({ kind: "latest", version: latestVersion });
    } catch (error) {
        setState({
            kind: "error",
            message: error instanceof Error ? error.message : "未知错误: " + String(error),
        });
    }
}