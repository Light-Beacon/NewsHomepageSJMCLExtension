export type SetStateAction<T> = T | ((current: T) => T);
export type StateSetter<T> = (value: SetStateAction<T>) => void;
export type ExtensionComponent = (...args: any[]) => unknown;

export interface ExtensionInfo {
  identifier: string;
  name: string;
  description?: string | null;
  author?: string | null;
  version?: string | null;
  minimalLauncherVersion?: string | null;
  path: string;
  iconSrc: string;
  frontend?: {
    entry: string;
  } | null;
}

export interface ExtensionAbilityData {
  config: Record<string, unknown>;
  selectedPlayer: { name?: string } | undefined;
  selectedInstance: { name?: string } | undefined;
  playerList: Array<Record<string, unknown>>;
  instanceList: Array<Record<string, unknown>>;
  routeQuery: Record<string, string | string[] | undefined>;
}

export interface ExtensionAbilityActions {
  getPlayerList: (sync?: boolean) => ExtensionAbilityData["playerList"] | undefined;
  getInstanceList: (sync?: boolean) => ExtensionAbilityData["instanceList"] | undefined;
  updateConfig: (path: string, value: unknown) => void;
  navigate: (route: string) => Promise<void>;
  openWindow: (route: string, title: string) => void;
  openExternalLink: (url: string) => Promise<void>;
  openSharedModal: (key: string, params?: unknown) => void;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  deleteDirectory: (path: string) => Promise<void>;
  request: (input: URL | Request | string, init?: RequestInit) => Promise<Response>;
  requestText: (
    url: string,
    init?: RequestInit,
    encoding?: string
  ) => Promise<string>;
  invoke: <T = unknown>(
    command: string,
    payload?: Record<string, unknown>
  ) => Promise<T>;
  logger: Record<string, (...args: any[]) => void>;
  reloadSelf: () => void;
}

export interface ExtensionAbilityState {
  useExtensionState: <T>(key: string, initialValue: T) => [T, StateSetter<T>];
}

export interface ExtensionHostContext {
  actions: ExtensionAbilityActions;
  state: ExtensionAbilityState;
}

export interface ExtensionFactoryApi {
  React: Record<string, any>;
  ChakraUI: Record<string, any>;
  Components: {
    OptionItem: ExtensionComponent;
    OptionItemGroup: ExtensionComponent;
    Section: ExtensionComponent;
    WrapCard: ExtensionComponent;
    WrapCardGroup: ExtensionComponent;
  };
  identifier: string;
  resolveAssetUrl: (path: string) => string;
  getHostContext: () => ExtensionHostContext;
  useHostData: () => ExtensionAbilityData;
}

export interface ExtensionHomeWidgetDefinition {
  key?: string;
  title: string;
  Component: ExtensionComponent;
  description?: string;
  icon?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface ExtensionSettingsPageDefinition {
  Component: ExtensionComponent;
}

export interface ExtensionPageDefinition {
  routePath: string;
  Component: ExtensionComponent;
  isStandAlone?: boolean;
}

export interface ExtensionRegistration {
  homeWidget?: ExtensionHomeWidgetDefinition;
  homeWidgets?: ExtensionHomeWidgetDefinition[];
  settingsPage?: ExtensionSettingsPageDefinition;
  page?: ExtensionPageDefinition;
  pages?: ExtensionPageDefinition[];
  dispose?: () => void;
}

export type ExtensionFactory = (
  api: ExtensionFactoryApi
) => ExtensionRegistration | void;

declare global {
  interface Window {
    registerExtension?: (factory: ExtensionFactory, token: string) => void;
  }
}
