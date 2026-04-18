import type { ExtensionFactoryApi } from "../types/sjmcl";

export function createSettingsPage(api: ExtensionFactoryApi) {
  const React = api.React;
  const { Box, Text } = api.ChakraUI;

  return function SettingsPage() {
    return React.createElement(
      Box,
      null,
      React.createElement(
        Text,
        null,
        "这里还什么都没有呢！"
      )
    );
  };
}
