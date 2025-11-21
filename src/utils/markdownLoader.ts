// Utility to load and parse markdown files with frontmatter
export interface PolicyFrontmatter {
  title: string;
  last_updated: string;
}

export interface PolicyContent {
  frontmatter: PolicyFrontmatter;
  content: string;
}

export async function loadPolicyMarkdown(path: string): Promise<PolicyContent> {
  try {
    const response = await fetch(path);
    const text = await response.text();
    
    // Parse frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = text.match(frontmatterRegex);
    
    if (match) {
      const frontmatterText = match[1];
      const content = match[2];
      
      // Parse YAML frontmatter (simple parser)
      const frontmatter: PolicyFrontmatter = {
        title: "Policy",
        last_updated: new Date().toISOString().split('T')[0],
      };
      
      frontmatterText.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
          if (key.trim() === 'title') {
            frontmatter.title = value;
          } else if (key.trim() === 'last_updated') {
            frontmatter.last_updated = value;
          }
        }
      });
      
      return { frontmatter, content };
    }
    
    // No frontmatter, return as-is
    return {
      frontmatter: {
        title: "Policy",
        last_updated: new Date().toISOString().split('T')[0],
      },
      content: text,
    };
  } catch (error) {
    console.error('Error loading markdown:', error);
    throw error;
  }
}

