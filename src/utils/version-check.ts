import type { ExtensionFactoryApi } from "../types/sjmcl";

const versionFeatures = [
    {
        name: "ExtensionUpdating",
        supportedSince: "1.0.0-beta.6",
        underSupportVersionAction:{
            type: "warning",
            description: "当前 SJMCL 版本（{version}）不支持插件更新，建议升级。"
        }
    }
]

function compareVersions(v1: string, v2: string): number {
    const v1Parts = v1.replace('-','.').replace('beta','-1').split('.')
    const v2Parts = v2.replace('-','.').replace('beta','-1').split('.')
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const part1 = v1Parts[i] || 0;
        const part2 = v2Parts[i] || 0;
        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }
    return 0;
}

export function checkVersionSupport(launcherVersion: string) {
    const unsupportedFeatures = versionFeatures.filter(feature => compareVersions(launcherVersion, feature.supportedSince) < 0);
    const actions = unsupportedFeatures.map(feature => feature.underSupportVersionAction);
    return actions;
}