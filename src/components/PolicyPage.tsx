import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Helmet } from "react-helmet-async";
import { Printer, Link2 } from "lucide-react";
import { Button } from "./ui/button";
import { loadPolicyMarkdown, PolicyContent } from "@/utils/markdownLoader";

interface PolicyPageProps {
  markdownPath: string;
  title: string;
  description: string;
}

const PolicyPage = ({ markdownPath, title, description }: PolicyPageProps) => {
  const [content, setContent] = useState<PolicyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await loadPolicyMarkdown(markdownPath);
        setContent(data);
      } catch (error) {
        console.error("Error loading policy content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [markdownPath]);


  const handlePrint = () => {
    window.print();
  };

  const canonicalUrl = `${window.location.origin}${location.pathname}`;
  const lastUpdated = content?.frontmatter.last_updated || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-[#222]/70">Loading policy...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#222] mb-4">Error</h1>
          <p className="text-[#222]/70">Failed to load policy content.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} | Nazaraa</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description: description,
            url: canonicalUrl,
            dateModified: lastUpdated,
            publisher: {
              "@type": "Organization",
              name: "Nazaraa",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-3xl py-16 px-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#222] mb-4">{content.frontmatter.title}</h1>
              {lastUpdated && (
                <p className="text-sm text-[#222]/70">
                  Last updated: {new Date(lastUpdated).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="print:hidden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Content */}
          <div className="prose prose-neutral max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold text-[#222] mb-4 mt-8 border-b border-[#E6E6E6] pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => {
                  const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "";
                  return (
                    <h2 
                      id={id}
                      className="text-2xl font-semibold text-[#222] mb-3 mt-8 border-b border-[#E6E6E6] pb-2 group"
                      {...props}
                    >
                      {props.children}
                      <a 
                        href={`#${id}`}
                        className="ml-2 text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Link to ${props.children}`}
                      >
                        <Link2 className="inline h-4 w-4" />
                      </a>
                    </h2>
                  );
                },
                h3: ({ node, ...props }) => {
                  const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "";
                  return (
                    <h3 
                      id={id}
                      className="text-xl font-semibold text-[#222] mb-2 mt-6 group"
                      {...props}
                    >
                      {props.children}
                      <a 
                        href={`#${id}`}
                        className="ml-2 text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Link to ${props.children}`}
                      >
                        <Link2 className="inline h-4 w-4" />
                      </a>
                    </h3>
                  );
                },
                p: ({ node, ...props }) => (
                  <p className="text-[#333] mb-4 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-[#333]" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-[#333]" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-[#333]" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-[#222]" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-[#FF6B35] hover:text-[#E55A2B] underline" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-8 border-[#E6E6E6]" {...props} />
                ),
              }}
            >
              {content.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolicyPage;

