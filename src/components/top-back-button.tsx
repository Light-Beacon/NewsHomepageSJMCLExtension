import { backIconPath } from "../resources/icons";
import type { ExtensionFactoryApi } from "../types/sjmcl";

type TopBackButtonProps = {
  onClick: () => void;
  onImage: boolean;
  ariaLabel?: string;
};

export function topBackButtonFactory(api: ExtensionFactoryApi) {
  const React = api.React;
  const { Box, IconButton, Icon, useColorModeValue } = api.ChakraUI;
  return function TopBackButton({
    onClick,
    onImage,
    ariaLabel = "返回",
  }: TopBackButtonProps) {
    return (
      <Box
        position="fixed"
        top="16px"
        left="16px"
        overflow="hidden"
        borderRadius="md"
        zIndex={30}
      >
        <Box
          position="absolute"
          inset={0}
          bg={useColorModeValue("whiteAlpha.300", "blackAlpha.300")}
          backdropFilter="blur(4px)"
          opacity={onImage ? 1 : 0}
          transition="opacity 0.36s ease-out"
          pointerEvents="none"
        />
        <Box position="relative">
          <IconButton
            size="sm"
            aria-label={ariaLabel}
            variant="ghost"
            icon={
              <Icon viewBox="72 72 440 440">
                {React.createElement("path", {
                  fill: "currentColor",
                  stroke: "currentColor",
                  d: backIconPath,
                })}
              </Icon>
            }
            onClick={onClick}
          />
        </Box>
      </Box>
    );
  };
}
