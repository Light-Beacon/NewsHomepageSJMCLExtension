import type { ExtensionFactoryApi } from "./types/sjmcl";
import { createMcVersionDetailPage } from "./pages/mc-version-detail";
import { createSettingsPage } from "./pages/settings-page";
import { createNewsWidget } from "./widgets/news";

(function registerExampleExtension(factory) {
  const token = document.currentScript?.dataset?.extensionToken || "";

  if (!token) {
    throw new Error("Missing extension activation token");
  }

  if (typeof window.registerExtension !== "function") {
    throw new Error("SJMCL host is unavailable");
  }

  window.registerExtension(factory, token);
})(function createExtension(api: ExtensionFactoryApi) {
  return {
    homeWidgets: [
      {
        title: "新闻主页",
        icon: api.resolveAssetUrl("assets/icons/news.png"),
        description: "提供最新的 Minecraft 中文新闻",
        Component: createNewsWidget(api),
        defaultWidth: 420,
        minWidth: 400,
        key: "news-homepage-widget",
      }
    ],
    settingsPage: {
      Component: createSettingsPage(api),
    },
    pages: [
      {
        routePath: "mcversiondetail",
        Component: createMcVersionDetailPage(api, false),
      }
    ],
  };
});
