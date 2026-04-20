import type { ExtensionFactoryApi } from "../types/sjmcl";
import { navigate } from "../utils/page-router";
import { newsCardFactory } from "../components/news-card";
import { getLatestVersions } from "../utils/news-homepage-api";
import { getVersionColor } from "../utils/version-info";
import { RepeatButtonFactory } from "../components/repeat-button";

export function createNewsWidget(api: ExtensionFactoryApi) {
  const React = api.React;
  const { Alert, AlertIcon, AlertTitle, AlertDescription, Center, IconButton, VStack, Skeleton } = api.ChakraUI;
  const NewsCard = newsCardFactory(api);
  const RepeatButton = RepeatButtonFactory(api);
  return function NewsWidget() {
    const [versionData, setVersionData] = React.useState(
      null as Record<string, unknown> | null,
    );
    const [loading, setLoading] = React.useState(true);
    const [cancel, setCancel] = React.useState(false);
    const [error, setError] = React.useState(
      null as Record<string, unknown> | null,
    );

    function loadNews(useCache = true) {
        setLoading(true);
        setError(null);

        void getLatestVersions(
          api,
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
              setError({
                message: err instanceof Error ? err.message : String(err),
              });
              setLoading(false);
            }
          },
          useCache,
        );
      }

    React.useEffect(() => {
      loadNews();
    }, []);

    if (error) {
      return (
        <Center>
          <Alert status='error' margin="5px" borderRadius="md">
            <AlertIcon />
            <AlertTitle whiteSpace="nowrap">加载失败</AlertTitle>
            <AlertDescription style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>{error?.message || "未知错误"}</AlertDescription>
            <RepeatButton action={() => {loadNews(false)}} />
          </Alert>
        </Center>
      );
    }
    if (loading) {
      return (
        <VStack align="stretch" spacing={3} padding="10px 7px">
          <Skeleton height="80px" borderRadius="md" />
          <Skeleton height="80px" borderRadius="md"/>
        </VStack>
      );
    }
    if (versionData) {
      const release = versionData.release as Record<string, unknown> | undefined;
      const snapshot = versionData.snapshot as Record<string, unknown> | undefined;

      function renderVersionCard(version: Record<string, unknown> | undefined) {
        if (!version) {
          return null;
        }

        const versionImageLink = version["version-image-link"]
          ? String(version["version-image-link"])
          : api.resolveAssetUrl("assets/placeholder.jpg");
        const versionId = String(version["version-id"] || "");
        const versionType = String(version["version-type"] || "");
        const versionTypeId = String(version["version-type-id"] || "");
        const hasVersionIntro = Boolean(version["intro"]);
        const versionIntro = String(version["intro"]);
        const isWip = Boolean(version["wip"]);

        return (
          <NewsCard
            imgSrc={versionImageLink}
            title={versionId}
            channel={`最新${versionType}`}
            channelColor={getVersionColor(versionTypeId)}
            description={isWip ? "该版本尚未翻译完成" : hasVersionIntro ? versionIntro : undefined}
            descriptionStyle={isWip ? "i" : undefined}
            action={!isWip ? () => {
              navigate(api, "~/mcversiondetail?version=" + versionId);
            } : undefined}
          />
        );
      }

      return (
        <VStack align="stretch" spacing={3} margin="10px 7px">
          {renderVersionCard(snapshot)}
          {renderVersionCard(release)}
        </VStack>
      );
    }
  };
}
