import type { ExtensionFactoryApi } from "./types/sjmcl";
import { createMcVersionDetailPage } from "./pages/mc-version-detail";
import { createExamplePage } from "./pages/example-page";
import { createSettingsPage } from "./pages/settings-page";
import { createConsoleWidget } from "./widgets/console";
import { createHomeWidget } from "./widgets/snapshot";

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
        title: "最新快照版: 26.2-snapshot-2",
        icon: api.resolveAssetUrl("assets/icons/snapshot.png"),
        description: "最新快照版",
        Component: createHomeWidget(api),
        defaultWidth: 600,
        minWidth: 300,
        key: "snapshot-widget",
      },
      {
        title: "最新正式版: 26.1.2",
        icon: api.resolveAssetUrl("assets/icons/release.png"),
        description: "最新正式版",
        Component: createHomeWidget(api),
        defaultWidth: 600,
        minWidth: 300,
        key: "release-widget",
      },
      {
        title: "Tauri 命令行终端",
        icon: api.resolveAssetUrl("assets/icons/console.png"),
        description: "调用中端执行命令，查看结果",
        Component: createConsoleWidget(api),
        defaultWidth: 600,
        key: "console-widget",
      },
    ],
    settingsPage: {
      Component: createSettingsPage(api),
    },
    pages: [
      {
        routePath: "mcversiondetail",
        Component: createMcVersionDetailPage(api, false),
      },
      {
        routePath: "example",
        Component: createExamplePage(api, false),
      }/*,
      {
        routePath: "example-standalone",
        isStandAlone: true,
        Component: createMcVersionDetailPage(api, true),
      },*/
    ],
  };
});
