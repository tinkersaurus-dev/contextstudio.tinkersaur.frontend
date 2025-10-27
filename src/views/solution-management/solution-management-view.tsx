"use client";

/**
 * Solution Management View
 *
 * Main view for managing solutions, components, and changes.
 * Provides a hierarchical interface for creating and organizing
 * solutions (products, services, processes, etc.) and their components.
 */

import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { SolutionTable } from "@/widgets/solution-management/ui/solution-table";

export function SolutionManagementView() {
  return (
    <Box minH="100vh" bg="panel.bg" py={8}>
      <Container maxW="container.xl">
        <Box mb={8}>
          <Heading size="2xl" mb={2} color="panel.text">
            Solution Management
          </Heading>
          <Text color="panel.text">
            Manage solutions, components, and changes for your products, services, and processes.
          </Text>
        </Box>

        <Box bg="white" _dark={{ bg: "gray.800" }} borderRadius="lg" p={6} shadow="sm">
          <SolutionTable />
        </Box>
      </Container>
    </Box>
  );
}
