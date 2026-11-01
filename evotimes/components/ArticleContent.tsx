import ReactMarkdown, { type Components } from "react-markdown";

// Renders article content written with simple formatting:
//   **bold**, *italic*, ## heading, - bullets, 1. numbered, > quote, [text](url)
// Raw HTML is NOT rendered (react-markdown ignores it), so it is safe.

const components: Components = {
  // The page already has an <h1> (the article title), so # and ## both
  // render as <h2>.
  h1: ({ children }) => (
    <h2 className="mb-3 mt-8 font-serif text-2xl font-bold">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 font-serif text-2xl font-bold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 font-serif text-xl font-bold">{children}</h3>
  ),
  // whitespace-pre-line keeps single line breaks the writer typed.
  p: ({ children }) => (
    <p className="mb-5 whitespace-pre-line leading-8">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 list-disc space-y-2 pl-6 leading-8">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal space-y-2 pl-6 leading-8">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="mb-5 border-l-4 border-red-700 pl-4 italic text-gray-700">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-red-700 underline hover:text-red-800"
    >
      {children}
    </a>
  ),
};

type ArticleContentProps = {
  /** Either the saved array of paragraphs or a single string. */
  content: string | string[];
  className?: string;
};

export default function ArticleContent({
  content,
  className,
}: ArticleContentProps) {
  const markdown = Array.isArray(content) ? content.join("\n\n") : content;

  return (
    <div className={className}>
      <ReactMarkdown components={components} disallowedElements={["img"]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}