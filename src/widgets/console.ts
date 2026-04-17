import type { ExtensionFactoryApi } from "../types/sjmcl";

export function createConsoleWidget(api: ExtensionFactoryApi) {
  const React = api.React;
  const { Box, Button, HStack, Input, Text, VStack } = api.ChakraUI;

  return function ConsoleWidget() {
    const host = api.getHostContext();
    const hostData = api.useHostData();
    const [logs, setLogs] = host.state.useExtensionState<string[]>(
      "homeWidgetLogs",
      []
    );
    const [commandInput, setCommandInput] = host.state.useExtensionState<string>(
      "homeWidgetCommandInput",
      ""
    );
    const [isInvoking, setIsInvoking] = host.state.useExtensionState<boolean>(
      "homeWidgetIsInvoking",
      false
    );

    function pushLog(message: string) {
      const time = new Date().toLocaleTimeString();
      setLogs(function (current) {
        return [...current, "[" + time + "] " + message].slice(-80);
      });
    }

    function getLogColor(line: string): string {
      const content = line.replace(/^\[[^\]]+\]\s*/, "");
      if (content.startsWith("!")) {
        return "red.300";
      }
      if (content.startsWith("<")) {
        return "green.300";
      }
      if (content.startsWith(">")) {
        return "white";
      }
      return "gray.100";
    }

    function formatInvokeResult(value: unknown): string {
      if (typeof value === "string") {
        return value;
      }
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }

    async function sendCommand() {
      const command = commandInput.trim();
      if (!command || isInvoking) {
        return;
      }

      setIsInvoking(true);
      pushLog("> " + command);

      try {
        const result = await host.actions.invoke(command);
        pushLog("< " + formatInvokeResult(result));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : formatInvokeResult(error);
        pushLog("! 错误: " + message);
      } finally {
        setIsInvoking(false);
      }
    }

    return React.createElement(
      VStack,
      { align: "stretch", spacing: 3 },
      React.createElement(
        HStack,
        { spacing: 3, align: "center" },
        React.createElement(Text, { fontSize: "sm", opacity: 0.75 }, "控制台日志"),
        React.createElement(
          Button,
          {
            size: "sm",
            ml: "auto",
            px: 2,
            variant: "ghost",
            title: "重新加载扩展",
            onClick: function () {
              pushLog("触发扩展重载");
              host.actions.reloadSelf();
            },
          },
          "重载扩展"
        ),
        React.createElement(
          Button,
          {
            size: "sm",
            px: 2,
            variant: "ghost",
            title: "清空日志",
            onClick: function () {
              setLogs([]);
            },
          },
          "清空日志"
        )
      ),
      React.createElement(
        Box,
        {
          bg: "blackAlpha.800",
          color: "green.200",
          borderRadius: "md",
          p: 3,
          minH: "120px",
          maxH: "220px",
          overflowY: "auto",
          fontFamily: "mono",
          fontSize: "12px",
          lineHeight: 1.45,
        },
        logs.length
          ? logs.map(function (line, index) {
              return React.createElement(
                Text,
                {
                  key: String(index),
                  whiteSpace: "pre-wrap",
                  color: getLogColor(line),
                },
                line
              );
            })
          : React.createElement(Text, { color: "gray.300" }, "> 暂无日志")
      ),
      React.createElement(
        HStack,
        { spacing: 2 },
        React.createElement(Input, {
          size: "sm",
          placeholder: "输入命令，例如: permission ls",
          value: commandInput,
          onChange: function (event: { target: { value: string } }) {
            setCommandInput(event.target.value);
          },
          onKeyDown: function (event: {
            key: string;
            preventDefault: () => void;
          }) {
            if (event.key === "Enter") {
              event.preventDefault();
              void sendCommand();
            }
          },
        }),
        React.createElement(
          Button,
          {
            size: "sm",
            colorScheme: "teal",
            isLoading: isInvoking,
            loadingText: "发送中",
            onClick: function () {
              void sendCommand();
            },
          },
          "发送"
        )
      )
    );
  };
}
