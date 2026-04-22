import type { ExtensionFactoryApi } from "../types/sjmcl";
import { checkVersionSupport } from "../utils/version-check";
import { footerFactory } from "../components/footer";
import { clearCache } from "../utils/news-homepage-api";

export function createSettingsPage(api: ExtensionFactoryApi) {
  const React = api.React;
  const {
    Box,
    Button,
    VStack,
    Text,
    Grid,
    GridItem,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Card,
    Wrap,
    WrapItem,
  } = api.ChakraUI;
  const Footer = footerFactory(api);

  return function SettingsPage() {
    const hostData = api.useHostData();
    const host = api.getHostContext();
    const launcherVersion = hostData.config.basicInfo.launcherVersion;
    return (
      <Grid
        templateAreas={`  "main"
                          "footer"`}
        templateRows={"1fr auto"}
        h="100%"
        gap="4"
        m="20px"
      >
        <GridItem area={"main"}>
          <VStack spacing="4" align="stretch">
            <Box>
              {checkVersionSupport(launcherVersion).map((action, index) => (
                <Alert status={action.type} key={index} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>
                      {action.type === "warning" ? "警告" : "提示"}
                    </AlertTitle>
                    <AlertDescription>
                      {action.description.replace("{version}", launcherVersion)}
                    </AlertDescription>
                  </Box>
                </Alert>
              ))}
            </Box>
            <Card padding="20px 30px">
              <VStack spacing="4" align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  插件设置
                </Text>
                <Wrap spacing='10px'>
                  <WrapItem>
                    <Button size= "md"
                      variant= "outline"
                      title= "清除缓存"
                      onClick= { () => {
                        clearCache();
                      }}>清除缓存</Button>
                  </WrapItem>
                  <WrapItem>
                    <Button size= "md"
                      variant= "outline"
                      title= "重新加载扩展"
                      onClick= { () => {
                        host.actions.reloadSelf();
                      }}>重新加载扩展</Button>
                  </WrapItem>
                </Wrap>
              </VStack>
            </Card>
          </VStack>
        </GridItem>
        <GridItem area={"footer"}>
          <Footer margin="0" />
        </GridItem>
      </Grid>
    );
  };
}
