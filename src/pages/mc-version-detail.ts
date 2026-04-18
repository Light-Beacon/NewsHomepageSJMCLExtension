import { backIconPath, creeperIconPath, wikiIconPath } from "../resources/icons";
import type { ExtensionFactoryApi } from "../types/sjmcl";
import { parseMarkdown } from "../utils/markdown-parser";
import { navigate } from "../utils/page-router";
import { getVersion } from "../utils/news-homepage-api";

export function createMcVersionDetailPage(
  api: ExtensionFactoryApi,
  standalone: boolean,
) {
  const React = api.React;
  const { Box, Text, VStack, HStack, Image, Skeleton, IconButton, Icon, useColorModeValue} =
    api.ChakraUI;
  const headerImageHeight = "160px";
  const backButtonSwitchScrollTop = 120;
  const customScrollbarSx = {
    scrollbarWidth: "none",
  };

  return function McVersionDetailPage() {
    const host = api.getHostContext();
    const hostData = api.useHostData();
    const version = hostData.routeQuery?.version;
    const [versionData, setVersionData] = React.useState(
      null as Record<string, unknown> | null,
    );
    const [loading, setLoading] = React.useState(true);
    const [cancel, setCancel] = React.useState(false);
    const [backButtonOnImage, setBackButtonOnImage] = React.useState(true);
    const [error, setError] = React.useState(
      null as Record<string, unknown> | null,
    );

    const backButton = React.createElement(IconButton, {
      size: "sm",
      "aria-label": "返回",
      variant: "ghost",
      /*color: backButtonOnImage ? "blackAlpha.900" : "whiteAlpha.900",*/
      icon: React.createElement(
        Icon,
        { viewBox: "72 72 440 440" },
        React.createElement("path", {
          fill: "currentColor",
          stroke: "currentColor",
          d: backIconPath,
        }),
      ),
      onClick: function () {
        setCancel(true);
        navigate(api, "/launch");
      },
    });

    var floatingBackButtons = React.createElement(
      VStack,
      {
        position: "sticky",
        top: "64px",
        zIndex: 20,
        alignSelf: "flex-start",
        ms: "16px",
      }
    );

    function createFloatingButton(onClick: Function, iconpath: string, viewBox: string = "0 0 512 512") {
      floatingBackButtons = React.cloneElement(floatingBackButtons, null, floatingBackButtons.props.children,
        React.createElement(IconButton, {
          size: "sm",
          "aria-label": "返回",
          variant: "ghost",
          icon: React.createElement(
            Icon,
            { viewBox: viewBox },
            React.createElement("path", {
              fill: "currentColor",
              stroke: "currentColor",
              d: iconpath
            }),
          ),
          onClick: onClick,
        }),
      );
    }

    React.useEffect(()=>{
        function loadMarkdown() {
          setLoading(true);
          setError(null);

          if (!version) {
            setVersionData(null);
            setError({ message: "缺少查询参数 version，例如 ?version=26w14a" });
            setLoading(false);
            return;
          }

          if (typeof version !== "string") {
            setVersionData(null);
            setError({ message: "查询参数 version 格式错误" });
            setLoading(false);
            return;
          }

          void getVersion(api, version,
            (data: Record<string, unknown>) => {if (!cancel) { 
              setVersionData(data); setError(null); setLoading(false); }},
            (err: unknown) => {if (!cancel) { 
              setVersionData(null); setError({ message: err instanceof Error ? err.message : String(err) }); setLoading(false); }}
          );
        }
        loadMarkdown();
      },
      [version],
    );

    function getVersionCard() {
      if (error) {
        return React.createElement(
          Box,
          {
            borderWidth: "1px",
            borderColor: "red.400",
            borderRadius: "md",
            p: 3,
            bg: "red.900",
            color: "red.100",
          },
          error.message,
        );
      }
      if (loading) {
        return React.createElement(
          VStack,
          { align: "stretch", spacing: 3 },
          React.createElement(Skeleton, { height: headerImageHeight }),
          React.createElement(
            HStack, { spacing: 3 , align: "top"},
            React.createElement( Skeleton, {  height: "200px", width:"32px", margin: "10px 0 16px 20px" }),
            React.createElement( Skeleton, { height: "200px", width:"100%", margin: "10px 30px 50px 16px" },)
          )
        );
      }
      if (versionData) {
        if (versionData["official-link"] && typeof versionData["official-link"] === "string") {
          createFloatingButton(
            function () {
              host.actions.openExternalLink(versionData["official-link"]);
            },
            creeperIconPath,
            "124 124 900 900"
          );
        }
        if (versionData["wiki-link"] && typeof versionData["wiki-link"] === "string") {
          createFloatingButton(
            function () {
              host.actions.openExternalLink(versionData["wiki-link"]);
            },
            wikiIconPath,
            "20 20 512 512"
          );
        }
        return React.createElement(
          VStack,
          { align: "stretch", spacing: 3 },
          React.createElement(Image, {
            src: versionData["version-image-link"],
            height: headerImageHeight,
            fit: "cover" /*alt: versionData.name, borderRadius: "md", mb: 3*/,
          }),
          React.createElement(
            Text,
            {
              fontSize: "4xl",
              fontWeight: "bold",
              margin: "-115px 70px 60px 70px",
              color: "whiteAlpha.900",
            },
            "Java 版 " + versionData.title || version || "未知版本",
          ),
          React.createElement(
            HStack,
            { spacing: 3 },
            floatingBackButtons,
            React.createElement(
              Box,
              {
                className: "markdown-preview",
                fontSize: "15px",
                lineHeight: 1.45,
                margin: "0 40px 50px 10px",
              },
              versionData?.markdown
                ? parseMarkdown(api, versionData.markdown)
                : "无内容",
            ),
          ),
        );
      } else {
        return React.createElement(
          Box,
          {
            borderWidth: "1px",
            borderColor: "red.400",
            borderRadius: "md",
            p: 3,
            bg: "red.900",
            color: "red.100",
          },
          "未提供版本数据",
        );
      }
    }

    return React.createElement(
      Box,
      { position: "relative", h: "100%", p: 0 },
      React.createElement(
        Box,
        {
          position: "fixed",
          top: "16px",
          left: "16px",
          bg: backButtonOnImage ?  useColorModeValue("whiteAlpha.300", "blackAlpha.300") : undefined,
          backdropFilter: backButtonOnImage ? "blur(4px)" : undefined,
          transition: "background-color 0.3s, backdrop-filter 0.3s",
          borderRadius: "md",
          zIndex: 30,
        },
        backButton,
      ),
      // 主要内容
      React.createElement(
        VStack,
        { align: "stretch", spacing: 3, p: 0, h: "100%" },
        React.createElement(
          Box,
          {
            p: 0,
            h: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            sx: customScrollbarSx,
            onScroll: (event: { currentTarget: { scrollTop: number } }) => {
              const nextOnImage = event.currentTarget.scrollTop < backButtonSwitchScrollTop;
              setBackButtonOnImage(nextOnImage);
            },
          },
          getVersionCard(),
        ),
      ),
    );
  };
}
