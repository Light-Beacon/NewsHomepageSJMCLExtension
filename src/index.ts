import type { ExtensionFactoryApi } from "./types/sjmcl";
import { createMcVersionDetailPage } from "./pages/mc-version-detail";
import { createSettingsPage } from "./pages/settings-page";
import { createNewsWidget } from "./widgets/news";
import { createConsoleWidget } from "./widgets/console";

const debugMode = false;

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
  const newsWidget = {
        title: "新闻主页",
        icon: api.resolveAssetUrl("assets/icons/news.png"),
        description: "提供最新的 Minecraft 中文新闻",
        Component: createNewsWidget(api),
        defaultWidth: 420,
        minWidth: 400,
        key: "news-homepage-widget",
      };
  const consoleWidget = {
        title: "控制台",
        icon: api.resolveAssetUrl("assets/icons/console.png"),
        description: "调试台",
        Component: createConsoleWidget(api),
        defaultWidth: 420,
        minWidth: 400,
        key: "console-widget",
      };
  const widgets = [newsWidget];
  if(debugMode){
    widgets.push(consoleWidget);
  }
  return {
    homeWidgets: widgets,
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
