import { getLatestVersions } from "./news-homepage-api";
import type { ExtensionFactoryApi } from "../types/sjmcl";

export function listWidgets(api: ExtensionFactoryApi) {
    getLatestVersions(api)
}