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
  const { Box, Text, VStack, HStack, Image, Skeleton, SkeletonText, IconButton, Icon, Tooltip, Grid, GridItem } =
    api.ChakraUI;
  const TopBackButton = topBackButtonFactory(api);
  const Footer = footerFactory(api);
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
        <Tooltip key={key} hasArrow label={tooltip} placement="left">
            <IconButton
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

    function getFloatingButtons()
    {
        if (error) { return null }
        if (loading) { return (
            <Skeleton height="200px"/>
        )}
        if (!versionData) { return null }
        const floatingButtons: unknown[] = [];
        const officialLink =
            typeof versionData["official-link"] === "string"
            ? versionData["official-link"]
            : null;
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
        const wikiLink =
            typeof versionData["wiki-link"] === "string"
            ? versionData["wiki-link"]
            : null;
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
        return floatingButtons;
    }

    function getHeader() {
      if (loading) {
        return <Skeleton height="100%"/>;
      }
      if (error || !versionData) {
        return <Box h="100%" />;
      }
      return (
        <Box height="100%" overflow="hidden">
            <Image
              src={versionData["version-image-link"]}
              width="100%"
              height="100%"
              fit="cover"
            />
            <Text
              fontSize="4xl"
              fontWeight="bold"
              margin="-100px 70px 30px 104px"
              color="whiteAlpha.900"
            >
              {`Java 版 ${versionData.title || version || "未知版本"}`}
            </Text>
        </Box>
      );
    }

    function getVersionCard() {
      if (error) { return (
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
      if (loading) { return (
           <SkeletonText noOfLines={4}
           spacing='4' skeletonHeight='3'
           mt="24px" />
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
      const markdown =
        typeof versionData.markdown === "string" ? versionData.markdown : null;

      return (
        <VStack align="stretch" spacing={3} mt="10px">
            <Box
                className="markdown-preview"
                fontSize="15px"
                lineHeight={1.45}
            >
                {markdown ? parseMarkdown(api, markdown) : "无内容"}
            </Box>
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
          <Grid
            p={0}
            templateAreas={`"header header"
                            "nav main"
                            "nav footer"`}
            gridTemplateRows={`150px 1fr auto`}
            gridTemplateColumns={'64px 1fr'}
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
                  if (scrollTop <= 2) {
                    return true;
                  }
                  if (prevOnImage) {
                    return scrollTop < backButtonSwitchScrollTop + backButtonHysteresis;
                  }
                  return scrollTop < backButtonSwitchScrollTop - backButtonHysteresis;
                });
              });
            }}
          >
            <GridItem area={'header'}>
                {getHeader()}
            </GridItem>
            <GridItem area={'main'} ml="40px" mr="80px">
                {getVersionCard()}
            </GridItem>
            <GridItem area={'nav'}>
                <VStack
                    position="sticky"
                    top="80px"
                    zIndex={20}
                    alignSelf="flex-start"
                    align="stretch"
                    mt="24px"
                    pl="16px"
                    pr="8px"
                >
                    {getFloatingButtons()}
                </VStack>
            </GridItem>
            <GridItem area={'footer'}>
                <Footer margin="20px 20px 20px 20px" />
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    );
  };
}
