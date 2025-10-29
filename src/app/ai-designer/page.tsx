/**
 * AI Designer Page
 * Standalone page for AI-powered component generation
 */

import { AIDesignGenerator } from '@/widgets/ai-design-generator/ui/ai-design-generator';
import { Box } from '@chakra-ui/react';

export default function AIDesignerPage() {
  return (
    <Box w="100vw" h="100vh" bg="white">
      <AIDesignGenerator />
    </Box>
  );
}
