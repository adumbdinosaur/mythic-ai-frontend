import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-amber-300/90">{children}</em>,
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = codeClass?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-black/40 rounded-lg p-3 my-2 overflow-x-auto">
                  <code className="text-xs text-gray-200 font-mono" {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code className="bg-white/10 rounded px-1.5 py-0.5 text-xs font-mono text-red-300" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-200">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-red-600/50 pl-3 my-2 text-gray-300 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-white/10 my-3" />,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline">
              {children}
            </a>
          ),
          h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-white mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="text-xs border-collapse w-full">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-white/10 bg-white/5 px-2 py-1 text-left text-gray-300 font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-white/10 px-2 py-1 text-gray-400">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
