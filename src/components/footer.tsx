import { ExtensionFactoryApi } from "../types/sjmcl";

type FooterProps = {
  margin?: String
};

export function footerFactory(api: ExtensionFactoryApi) {
  const React = api.React;
  const {
    VStack,
    Text,
    Card,
    Image,
    Grid,
    HStack,
    useColorModeValue,
    Flex,
    Link,
    Heading,
  } = api.ChakraUI;

  return function Footer({
    margin,
  }: FooterProps) {
    const host = api.getHostContext();
    const hostData = api.useHostData();
    return (
        <Card margin={margin || "20px"} padding="10px 20px">
            <VStack align="start" spacing={1} padding="10px">
                <Heading fontSize="xl" as="b" textAlign="center" lineHeight="1.2">
                    新闻主页 - SJMCL 插件版
                </Heading>
                <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} textAlign="center" lineHeight="1.2">
                    本页面开源协议：
                    <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">
                        CC BY-NC-SA 4.0
                    </Link>
                </Text>
                <HStack spacing={2} margin="5px 0">
                    <Image height="40px" src="https://i1.hdslb.com/bfs/new_dyn/e99efb617405ec301ea469da96e1081b277543816.png" />
                    <Image height="40px" src="https://i1.hdslb.com/bfs/new_dyn/ae62d18476b04e732aa3725d5a8e0199277543816.png" />
                </HStack>
            </VStack>
        </Card>
    );
  }
}