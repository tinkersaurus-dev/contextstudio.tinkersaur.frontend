"use client";

import { Flex, HStack, Text, Avatar, Link as ChakraLink, Icon } from "@chakra-ui/react";
import NextLink from "next/link";
import { Switch } from "@/shared/ui/switch";
import { useColorMode } from "@/shared/ui/color-mode";
import { FaSun, FaMoon } from "react-icons/fa";

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex
      as="header"
      height="40px"
      width="100%"
      alignItems="center"
      paddingX="4"
      borderBottomWidth="1px"
      borderBottomColor="border"
      bg="header.bg"
    >
      {/* Application Name */}
      <Text fontWeight="semibold" fontSize="md" color="header.title">
        Tinkersaur.us
      </Text>

      {/* Navigation */}
      <HStack marginLeft="8" gap="4">
        <ChakraLink
          asChild
          fontSize="sm"
          color="header.nav"
          _hover={{ color: "header.nav.hover" }}
        >
          <NextLink href="/scope">Scope</NextLink>
        </ChakraLink>
        <ChakraLink
          asChild
          fontSize="sm"
          color="header.nav"
          _hover={{ color: "header.nav.hover" }}
        >
          <NextLink href="/context-studio">Design</NextLink>
        </ChakraLink>
      </HStack>

      {/* Spacer to push controls to the right */}
      <Flex flex="1" />

      {/* Theme Toggle */}
      <HStack gap="3">
        <Switch
          size="sm"
          colorPalette="blue"
          checked={isDark}
          onCheckedChange={toggleColorMode}
          trackLabel={{
            on: <Icon as={FaSun} color="yellow.400" />,
            off: <Icon as={FaMoon} color="gray.400" />,
          }}
        />

        {/* Avatar */}
        <Avatar.Root size="xs">
          <Avatar.Fallback />
        </Avatar.Root>
      </HStack>
    </Flex>
  );
};
