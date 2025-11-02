"use client";

import { useThemeVariant } from "@/app/themes/use-theme-variant";
import { useColorMode } from "@/shared/ui/color-mode";
import { NativeSelect, Stack } from "@chakra-ui/react";

/**
 * Theme Selector Component
 *
 * Allows users to switch between:
 * - Theme variants (Standard/Colorblind-Friendly)
 * - Color modes (Light/Dark)
 *
 * Selections are persisted to localStorage and applied instantly.
 */
export function ThemeSelector() {
  const { variant, setVariant } = useThemeVariant();
  const { colorMode, setColorMode } = useColorMode();

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setVariant(event.target.value as "standard" | "deuteranopia");
  };

  const handleColorModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setColorMode(event.target.value as "light" | "dark");
  };

  return (
    <Stack direction="row" gap="2">
      {/* Theme Variant Selector */}
      <NativeSelect.Root size="sm" width="auto" minWidth="140px">
        <NativeSelect.Field
          value={variant}
          onChange={handleVariantChange}
          color="header.nav"
          bg="transparent"
          borderColor="header.nav"
          _hover={{
            borderColor: "header.nav.hover",
            color: "header.nav.hover",
          }}
          _focus={{
            borderColor: "header.nav.hover",
            color: "header.nav.hover",
          }}
        >
          <option value="standard">Standard</option>
          <option value="deuteranopia">Colorblind-Friendly</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator color="header.nav" />
      </NativeSelect.Root>

      {/* Color Mode Selector */}
      <NativeSelect.Root size="sm" width="auto" minWidth="100px">
        <NativeSelect.Field
          value={colorMode || "light"}
          onChange={handleColorModeChange}
          color="header.nav"
          bg="transparent"
          borderColor="header.nav"
          _hover={{
            borderColor: "header.nav.hover",
            color: "header.nav.hover",
          }}
          _focus={{
            borderColor: "header.nav.hover",
            color: "header.nav.hover",
          }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator color="header.nav" />
      </NativeSelect.Root>
    </Stack>
  );
}
