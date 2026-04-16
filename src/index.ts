import { createExamplePage } from "./pages/example-page";
import { createSettingsPage } from "./pages/settings-page";
import { createHomeWidget } from "./widgets/home-widget";

(function registerExampleExtension(factory) {
  const token = document.currentScript?.dataset?.extensionToken || "";

  if (!token) {
    throw new Error("Missing extension activation token");
  }

  if (typeof window.registerExtension !== "function") {
    throw new Error("SJMCL host is unavailable");
  }

  window.registerExtension(factory, token);
})(function createExtension(api) {
  return {
    homeWidget: {
      title: "Minecraft News Extension",
      description: "Provides latest Minecraft news on SJMCL",
      defaultWidth: 360,
      minWidth: 300,
      Component: createHomeWidget(api),
    },
    settingsPage: {
      Component: createSettingsPage(api),
    },
    pages: [
      {
        routePath: "example",
        Component: createExamplePage(api, false),
      },
      {
        routePath: "example-standalone",
        isStandAlone: true,
        Component: createExamplePage(api, true),
      },
    ],
  };
});
