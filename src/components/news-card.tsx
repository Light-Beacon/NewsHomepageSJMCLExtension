import type { ExtensionFactoryApi } from "../types/sjmcl";

type NewsCardProps = {
  imgSrc: string;
  title: string;
  channel?: string;
  channelColor?: string;
  description?: string;
  descriptionStyle?: string;
  action?: () => void;
};

export function newsCardFactory(api: ExtensionFactoryApi) {
  const React = api.React;
  const {
    Badge,
    Box,
    Text,
    Card,
    Image,
    Grid,
    useColorModeValue,
    Flex,
  } = api.ChakraUI;

  return function NewsCard({
    imgSrc,
    title,
    channel,
    channelColor,
    description,
    descriptionStyle,
    action,
  }: NewsCardProps) {
    const host = api.getHostContext();
    const hostData = api.useHostData();
    const [isHovered, setIsHovered] = React.useState(false);
    const appearanceConfig = hostData.config as {
      appearance?: { theme?: { primaryColor?: string } };
    };
    const primaryColor =
      channelColor ||
      appearanceConfig.appearance?.theme?.primaryColor ||
      "blue";
    const hoverAlphaPercent = action ? 3 : 1;
    const hoverBackgroundColor = `color-mix(in srgb, var(--chakra-colors-${primaryColor}-${useColorModeValue("100", "700")}) ${hoverAlphaPercent}%, ${useColorModeValue("#f6f6f6", "#1A1A1D")})`;
    const hoverTextColor = `color-mix(in srgb, var(--chakra-colors-${primaryColor}-${useColorModeValue("800", "200")}) ${hoverAlphaPercent}%, currentColor)`;
    return (
      <Card
        cursor={action ? "pointer" : "default"}
        backgroundColor={
          isHovered
            ? hoverBackgroundColor
            : useColorModeValue("#f6f6f6", "#1A1A1D")
        }
        boxShadow={
          isHovered
            ? action
              ? `0 0 0 1px var(--chakra-colors-${primaryColor}-${useColorModeValue("400", "700")})`
              : `0 0 0 1px ${useColorModeValue("#88888888", "#44444588")}`
            : "xs"
        }
        transition="box-shadow 0.2s, background-color 0.2s"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={action}
      >
        <Grid templateColumns="clamp(96px, 32%, 160px) minmax(0, 1fr)" gap={1} height="80px">
          <Box height="80px" width="100%" overflow="hidden" borderRadius="0.375rem 0 0 0.375rem">
            <Image
              src={imgSrc}
              alt={title}
              objectFit="cover"
              width="100%"
              height="100%"
              display="block"
            />
          </Box>
          <Flex
            margin="0px 10px"
            align="start"
            flexDirection="column"
            justifyContent="center"
          >
            {channel && (
              <Badge colorScheme={channelColor || primaryColor}>
                {channel}
              </Badge>
            )}
            <Text
              fontSize="xl"
              fontWeight="bold"
              margin="4px 2px"
              lineHeight="1.2"
              transition="color 0.2s"
              color={isHovered ? hoverTextColor : "auto"}
            >
              {title}
            </Text>
            {description && (
              <Text
                fontSize="xs"
                margin="0 2px"
                lineHeight="1"
                as={descriptionStyle || ""}
              >
                {description}
              </Text>
            )}
          </Flex>
        </Grid>
      </Card>
    );
  };
}
