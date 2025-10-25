/**
 * Document Editor Test Page
 *
 * Test page for the document editor at route /editor.
 * Provides a full-page view of the markdown editor for testing.
 */

'use client';

import { DocumentEditor } from '@/widgets/document-editor';
import { Box } from '@chakra-ui/react';

const SAMPLE_CONTENT = `# Document Editor Test

Welcome to the **markdown editor**!

## Features

- Line numbers on the left
- Live preview
- Multiple view modes (Edit, Split, Preview)
- GitHub Flavored Markdown support

## Code Example

\`\`\`typescript
function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Tables

| Feature | Status |
|---------|--------|
| Line Numbers | ✅ |
| Preview | ✅ |
| Split View | ✅ |

## Lists

1. First item
2. Second item
   - Nested item
   - Another nested item
3. Third item

---

> This is a blockquote. Use it for emphasis or citations.

Start editing to see the live preview update!
`;

export default function EditorPage() {
  return (
    <Box width="100vw" height="100vh" bg="white">
      <DocumentEditor
        initialContent={SAMPLE_CONTENT}
        onContentChange={(content) => {
          console.log('Content changed:', content.substring(0, 50) + '...');
        }}
        onSave={(content) => {
          console.log('Save triggered! Content length:', content.length);
          alert('Save triggered! Check console for content.');
        }}
      />
    </Box>
  );
}
