import type { ExtensionFactoryApi } from "../types/sjmcl";

type IconProps = {
  action?: () => void;
};

export function RepeatButtonFactory(api: ExtensionFactoryApi) {
  const React = api.React;
  const { IconButton, Icon } = api.ChakraUI;

  return function RepeatButton({ action }: IconProps) {
    return React.createElement(IconButton, {
      onClick: action,
      variant: "ghost",
      "aria-label": "Reload",
      icon: React.createElement(
        Icon,
        { viewBox: "0 0 30 30" },
        React.createElement("path", {
          fill: "currentColor",
          d: "M 15 3 L 15 6 C 10.041282 6 6 10.04128 6 15 C 6 19.95872 10.041282 24 15 24 C 19.958718 24 24 19.95872 24 15 C 24 13.029943 23.355254 11.209156 22.275391 9.7246094 L 20.849609 11.150391 C 21.575382 12.253869 22 13.575008 22 15 C 22 18.87784 18.877838 22 15 22 C 11.122162 22 8 18.87784 8 15 C 8 11.12216 11.122162 8 15 8 L 15 11 L 20 7 L 15 3 z",
        }),
      ),
    });
  };
}