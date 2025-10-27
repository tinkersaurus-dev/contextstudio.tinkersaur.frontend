"use client";

import { useTheme } from "@/app/themes";
import { NativeSelect } from "@chakra-ui/react";

/**
 * Theme Selector Component
 *
 * Dropdown that allows users to switch between available themes.
 * Theme selection is persisted to localStorage and triggers a page reload
 * to apply the new theme.
 */
export function ThemeSelector() {
  const { currentThemeId, availableThemeIds, setTheme } = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };

  // Format theme ID for display (capitalize first letter, replace hyphens with spaces)
  const formatThemeName = (themeId: string): string => {
    return themeId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <NativeSelect.Root size="sm" width="auto" minWidth="120px">
      <NativeSelect.Field
        value={currentThemeId}
        onChange={handleThemeChange}
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
        {availableThemeIds.map((themeId) => (
          <option key={themeId} value={themeId}>
            {formatThemeName(themeId)}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator color="header.nav" />
    </NativeSelect.Root>
  );
}
