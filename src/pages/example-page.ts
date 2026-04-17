import type { ExtensionFactoryApi } from "../types/sjmcl";
import { parseMarkdown } from "../utils/markdown_parser";

export function createExamplePage(
  api: ExtensionFactoryApi,
  standalone: boolean
) {
  const React = api.React;
  const { Box, HStack, Text, Textarea, VStack } = api.ChakraUI;

  return function ExamplePage() {
    const host = api.getHostContext();
    const hostData = api.useHostData();
    const [markdownInput, setMarkdownInput] = host.state.useExtensionState<string>(
      "snapshotMarkdownInput",
      "# Markdown 预览\n\n- 左侧输入\n- 右侧实时解析\n\n**加粗**、*斜体*、`代码`"
    );

    return React.createElement(
      VStack,
      { align: "stretch", spacing: 3, h: "100%" },
      React.createElement(
        Text,
        { fontSize: "sm", fontWeight: "bold" },
        hostData.routeQuery && hostData.routeQuery.version
          ? `当前版本（来自路由查询参数）: ${hostData.routeQuery.version}`
          : "路由查询参数中未传入版本"
      ),
      React.createElement(
        Text,
        { fontSize: "sm", fontWeight: "bold" },
        "Markdown 双栏预览"
      ),
      React.createElement(
        HStack,
        { spacing: 3, align: "stretch", h: "360px" },
        React.createElement(
          Box,
          {
            flex: 1,
            borderWidth: "1px",
            borderColor: "whiteAlpha.300",
            borderRadius: "md",
            color: "whiteAlpha.900",
            p: 2,
            bg: "blackAlpha.300",
          },
          React.createElement(Text, { fontSize: "xs", mb: 2, opacity: 0.8 }, "输入区"),
          React.createElement(Textarea, {
            h: "calc(100% - 24px)",
            resize: "none",
            fontFamily: "mono",
            fontSize: "12px",
            value: markdownInput,
            placeholder: "在这里输入 Markdown",
            onChange: function (event: { target: { value: string } }) {
              setMarkdownInput(event.target.value);
            },
          })
        ),
        React.createElement(
          Box,
          {
            flex: 1,
            borderWidth: "1px",
            borderColor: "whiteAlpha.300",
            borderRadius: "md",
            color: "whiteAlpha.900",
            p: 2,
            bg: "blackAlpha.300",
            overflowY: "auto",
          },
          React.createElement(Text, { fontSize: "xs", mb: 2, opacity: 0.8 }, "显示区"),
          React.createElement(
            Box,
            { className: "markdown-preview", fontSize: "13px", lineHeight: 1.7 },
            parseMarkdown(api, markdownInput)
          )
        ),
      )
    );
  };
}
