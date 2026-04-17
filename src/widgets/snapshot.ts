import type { ExtensionFactoryApi } from "../types/sjmcl";
import {navigate} from "../utils/page_router";

export function createHomeWidget(api: ExtensionFactoryApi) {
  const React = api.React;
  const { Badge, Button, HStack, Text, VStack } = api.ChakraUI;

  return function HomeWidget() {
    const host = api.getHostContext();
    const hostData = api.useHostData();
    
    return React.createElement(
      VStack,
      { align: "stretch", spacing: 3 },
      React.createElement(
        HStack,
        { justify: "space-between", align: "center" },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "Minecraft News Extension"),
        React.createElement(
          Badge,
          { colorScheme: "green", variant: "subtle" },
          api.identifier
        )
      ),
      React.createElement(Text, { fontSize: "sm" }, "Provides latest Minecraft news on SJMCL"),
      React.createElement(
        Text,
        { fontSize: "xs", className: "secondary-text" },
        "Current player: ",
        (hostData.selectedPlayer && hostData.selectedPlayer.name) || "None"
      ),
      React.createElement(
        HStack,
        { spacing: 3 },
        React.createElement(
          Button,
          {
            size: "sm",
            onClick: function () {
              host.actions.navigate("/extension/" + api.identifier + "/mcversiondetail?version=26.1");
            },
          },
          "打开示例页"
        ),
        React.createElement(
          Button,
          {
            size: "sm",
            onClick: function () {
              //host.actions.navigate("/extension/" + api.identifier + "/example");
              navigate(api, "/discover/minecraft-news");
            },
          },
          "打开发现页"
        ),
        React.createElement(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: function () {
              //host.actions.navigate("/extension/" + api.identifier + "/example");
              host.actions.reloadSelf();
              //host.actions.
            },
          },
          "重新加载扩展"
        )
        /*React.createElement(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: function () {
              host.actions.openWindow(
                "/standalone/extension/" +
                  api.identifier +
                  "/example-standalone",
                "Example Standalone Page"
              );
            },
          },
          "Open Standalone Page"
        )*/
      ),
      React.createElement(
        HStack,
        { spacing: 3 },
        React.createElement(
          Button,
          {
            size: "sm",
            onClick: function () {
              host.actions.logger.info(host.actions.invoke("permission ls"));
            },
          },
          "运行权限查询命令"
        ),
        React.createElement(
          Text,
          { fontSize: "sm", fontWeight: "bold" },
        ),
      )
    );
  };
}
