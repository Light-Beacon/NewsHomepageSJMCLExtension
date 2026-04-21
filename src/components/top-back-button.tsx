import { backIconPath } from "../resources/icons";
import type { ExtensionFactoryApi } from "../types/sjmcl";

type TopBackButtonProps = {
  onClick: () => void;
  onImage: boolean;
  ariaLabel?: string;
};

export function topBackButtonFactory(api: ExtensionFactoryApi) {
  const React = api.React;
  const { Box, IconButton, Icon, Tooltip, Divider, VStack, useColorModeValue} =
    api.ChakraUI;
  return function TopBackButton({
    onClick,
    onImage,
    ariaLabel = "返回",
  }: TopBackButtonProps) {
    return (
      <VStack
        position="fixed"
        top="16px"
        right="16px"
        zIndex={30}
      >
        <Box position="relative" overflow="hidden" borderRadius="md">
            <Box
                position="absolute"
                inset={0}
                bg={useColorModeValue("whiteAlpha.400", "blackAlpha.300")}
                backdropFilter="blur(8px)"
                opacity={onImage ? 1 : 0}
                transition="opacity 0.36s ease-out"
                pointerEvents="none"
            />
            <Box position="relative">
            <Tooltip hasArrow label="返回" placement="left">
                <IconButton
                width="32px"
                size="md"
                aria-label={ariaLabel}
                variant="ghost"
                icon={
                    <Icon viewBox="2 2 22 22">
                    {React.createElement("path", {
                        fill: "currentColor",
                        d: backIconPath,
                    })}
                    </Icon>
                }
                onClick={onClick}
                />
            </Tooltip>
            </Box>
        </Box>
        <Box m="2px 0 0 0" inset="0" opacity={onImage ? 0 : 1} 
            position="relative" h="1px" minW="24px" bg="currentColor"
            transition="opacity 0.36s ease-out"/>
      </VStack>
    );
  };
}
