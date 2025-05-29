// Utility to extract headings from markdown
export function getTableOfContents(content: string) {
  const lines = content.split("\n");
  const headings: { id: string; text: string; level: number }[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      // Generate a slug/id for anchor links
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      headings.push({ id, text, level });
    }
  }
  return headings;
} 