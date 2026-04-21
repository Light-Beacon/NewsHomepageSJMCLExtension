import { creeperIconPath, wikiIconPath } from "../resources/icons";
import { topBackButtonFactory } from "../components/top-back-button";
import type { ExtensionFactoryApi } from "../types/sjmcl";
import { parseMarkdown } from "../utils/markdown-parser";
import { navigate } from "../utils/page-router";
import { getVersion } from "../utils/news-homepage-api";
import { footerFactory } from "../components/footer";

export function createMcVersionDetailPage(
  api: ExtensionFactoryApi,
  standalone: boolean,
) {
  const React = api.React;
  const { Box, Text, VStack, HStack, Image, Skeleton, IconButton, Icon, Tooltip } =
    api.ChakraUI;
  const TopBackButton = topBackButtonFactory(api);
  const Footer = footerFactory(api);
  const headerImageHeight = "160px";
  const backButtonSwitchScrollTop = 120;
  const backButtonHysteresis = 24;
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
    const scrollRafRef = React.useRef(null) as { current: number | null };
    const [error, setError] = React.useState(
      null as Record<string, unknown> | null,
    );

    React.useEffect(
      () => () => {
        if (scrollRafRef.current !== null) {
          cancelAnimationFrame(scrollRafRef.current);
        }
      },
      [],
    );

    React.useEffect(() => {
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

        void getVersion(
          api,
          version,
          (data: Record<string, unknown>) => {
            if (!cancel) {
              setVersionData(data);
              setError(null);
              setLoading(false);
            }
          },
          (err: unknown) => {
            if (!cancel) {
              setVersionData(null);
              setError({ message: err instanceof Error ? err.message : String(err) });
              setLoading(false);
            }
          },
        );
      }

      loadMarkdown();
    }, [version]);

    function renderFloatingButton(
      key: string,
      onClick: () => void,
      iconPath: string,
      tooltip = "",
      viewBox = "0 0 512 512",
    ) {
      return (
        <Tooltip hasArrow label={tooltip} placement='right'>
            <IconButton
            key={key}
            size="sm"
            aria-label="返回"
            variant="ghost"
            icon={
                <Icon viewBox={viewBox}>
                {React.createElement("path", {
                    fill: "currentColor",
                    stroke: "currentColor",
                    d: iconPath,
                })}
                </Icon>
            }
            onClick={onClick}
            />
        </Tooltip>
      );
    }

    function getVersionCard() {
      if (error) {
        return (
          <Box
            borderWidth="1px"
            borderColor="red.400"
            borderRadius="md"
            p={3}
            bg="red.900"
            color="red.100"
          >
            {error.message}
          </Box>
        );
      }

      if (loading) {
        return (
          <VStack align="stretch" spacing={3}>
            <Skeleton height={headerImageHeight} />
            <HStack spacing={3} align="top">
              <Skeleton height="200px" width="32px" margin="10px 0 16px 20px" />
              <Skeleton height="200px" width="100%" margin="10px 30px 50px 16px" />
            </HStack>
          </VStack>
        );
      }

      if (!versionData) {
        return (
          <Box
            borderWidth="1px"
            borderColor="red.400"
            borderRadius="md"
            p={3}
            bg="red.900"
            color="red.100"
          >
            未提供版本数据
          </Box>
        );
      }

      const officialLink =
        typeof versionData["official-link"] === "string"
          ? versionData["official-link"]
          : null;
      const wikiLink =
        typeof versionData["wiki-link"] === "string"
          ? versionData["wiki-link"]
          : null;
      const markdown =
        typeof versionData.markdown === "string" ? versionData.markdown : null;

      const floatingButtons: unknown[] = [];
      if (officialLink) {
        floatingButtons.push(
          renderFloatingButton(
            "official-link",
            () => host.actions.openExternalLink(officialLink),
            creeperIconPath,
            "查看官网更新日志",
            "124 124 900 900",
          ),
        );
      }
      if (wikiLink) {
        floatingButtons.push(
          renderFloatingButton(
            "wiki-link",
            () => host.actions.openExternalLink(wikiLink),
            wikiIconPath,
            "查看 Minecraft Wiki 上的更新日志",
            "20 20 512 512",
          ),
        );
      }

      return (
        <VStack align="stretch" spacing={3}>
          <Image
            src={versionData["version-image-link"]}
            height={headerImageHeight}
            fit="cover"
          />
          <Text
            fontSize="4xl"
            fontWeight="bold"
            margin="-115px 70px 60px 70px"
            color="whiteAlpha.900"
          >
            {`Java 版 ${versionData.title || version || "未知版本"}`}
          </Text>
          <HStack spacing={3}>
            <VStack
              position="sticky"
              top="64px"
              zIndex={20}
              alignSelf="flex-start"
              ms="16px"
            >
              {floatingButtons}
            </VStack>
            <Box
              className="markdown-preview"
              fontSize="15px"
              lineHeight={1.45}
              margin="0 40px 50px 10px"
            >
              {markdown ? parseMarkdown(api, markdown) : "无内容"}
            </Box>
          </HStack>
        </VStack>
      );
    }

    return (
      <Box position="relative" h="100%" p={0}>
        <TopBackButton
          onImage={backButtonOnImage}
          onClick={() => {
            setCancel(true);
            navigate(api, "/launch");
          }}
        />
        <VStack align="stretch" spacing={3} p={0} h="100%">
          <Box
            p={0}
            h="100%"
            overflowY="auto"
            overflowX="hidden"
            sx={customScrollbarSx}
            onScroll={(event: { currentTarget: { scrollTop: number } }) => {
              const scrollTop = event.currentTarget.scrollTop;
              if (scrollRafRef.current !== null) {
                cancelAnimationFrame(scrollRafRef.current);
              }
              scrollRafRef.current = requestAnimationFrame(() => {
                scrollRafRef.current = null;
                setBackButtonOnImage((prevOnImage: boolean) => {
                  if (prevOnImage) {
                    return scrollTop < backButtonSwitchScrollTop + backButtonHysteresis;
                  }
                  return scrollTop < backButtonSwitchScrollTop - backButtonHysteresis;
                });
              });
            }}
          >
            {getVersionCard()}
            <Footer margin="20px 20px 20px 70px" />
          </Box>
        </VStack>
      </Box>
    );
  };
}
