const versionColorMapping: Record<string, string> = {
    "Release-Candidate": "yellow",
    "Snapshot": "blue",
    "Release": "red",
    "Pre-Release": "green",
};

export function getVersionColor(versionType: string): string {
    return versionColorMapping[versionType] || "gray";
}