import type { ExtensionFactoryApi } from "../types/sjmcl";
import { checkForUpdates } from "../utils/updater"
import type { UpdateState, VersionInfo } from "../utils/updater"

export function createUpdateCheckCard(api: ExtensionFactoryApi) {
	const React = api.React;
    const host = api.getHostContext();
	const {
		Alert,
		AlertIcon,
		AlertTitle,
		AlertDescription,
		Box,
		Button,
		HStack,
		Spinner,
		Text,
	} = api.ChakraUI;

	return function UpdateCheckCard() {
		
		const [state, setState] = React.useState({ kind: "checking" } as UpdateState);
		React.useEffect(() => {
			void checkForUpdates(api, setState);
		}, []);

		let status: "info" | "success" | "warning" | "error" = "info";
		let title = "正在检查插件更新...";
		let description: string | null = null;
		let actions: any[] = [];

		if (state.kind === "error") {
			status = "error";
			title = "检查更新失败";
			description = state.message;
			actions = [
				<Button key="retry" size="sm" variant="outline" 
                    onClick={() => checkForUpdates(api, setState, false)}>
					重试
				</Button>,
			];
		} else if (state.kind === "latest") {
			status = "success";
			title = `已经是最新版`;
		} else if (state.kind === "update") {
            const latestVersion: VersionInfo = state.version
			status = "warning";
			title = `发现了新的插件版本：${latestVersion.id}`;
			actions = [
				/*<Button key="open-update-log" size="sm" variant="outline" isDisabled>
					阅读更新日志
				</Button>,*/
				<Button key="update-extension" size="sm" variant="outline"
                    onClick={() => {
                        setState({ kind: "updating", version: latestVersion });
                        host.actions.updateSelf(latestVersion.downloadUrl, latestVersion.id)}}>
                        更新
                </Button>,
			];
		} else if (state.kind === "developing") {
            const latestVersion: VersionInfo = state.version
			status = "success";
			title = `当前为开发版本（最新版本：${latestVersion.id}）`;
			actions = [
				<Button key="switch-to-release-channel" size="sm" variant="outline"
                    onClick={() => {
                    setState({ kind: "updating", version: latestVersion });
                    host.actions.updateSelf(latestVersion.downloadUrl, latestVersion.id)}}>
					切换到正式版
				</Button>,
			];
        }
        else if (state.kind === "updating") {
            const latestVersion: VersionInfo = state.version
			status = "info";    
			title = `正在更新插件 (${latestVersion.id})...`;
        }

		return (
			<Alert status={status} borderRadius="md" alignItems="center" py={3} px={4}>
				{state.kind === "checking" || state.kind === "updating" ? <Spinner size="sm" /> : <AlertIcon />}
				<Box flex="1" minW="0" ml={3}>
					<AlertTitle whiteSpace="nowrap">{title}</AlertTitle>
					{description ? (
						<AlertDescription>
							<Text fontSize="sm" opacity={0.85} noOfLines={1}>
								{description}
							</Text>
						</AlertDescription>
					) : null}
				</Box>
				{actions.length ? (
					<HStack spacing={2} flexShrink={0} ml={4}>
						{actions}
					</HStack>
				) : null}
			</Alert>
		);
	};
}
