"use client";

import { Flex, HStack, Text, Avatar, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

export const Header = () => {
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
          <NextLink href="/context-studio">Context Studio</NextLink>
        </ChakraLink>
      </HStack>

      {/* Spacer to push avatar to the right */}
      <Flex flex="1" />

      {/* Avatar */}
      <Avatar.Root size="xs">
        <Avatar.Fallback />
      </Avatar.Root>
    </Flex>
  );
};
