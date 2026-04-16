import type { ExtensionFactoryApi } from "../types/sjmcl";

export function createExamplePage(
  api: ExtensionFactoryApi,
  standalone: boolean
) {
  const React = api.React;
  const { Box, Text } = api.ChakraUI;

  return function ExamplePage() {
    return React.createElement(
      Box,
      null,
      React.createElement(
        Text,
        null,
        `Hello, this is an example ${standalone ? "standalone " : ""}custom page of your extension`
      )
    );
  };
}
