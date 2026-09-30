import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, isStreaming }) => {
  if (!content) return null;

  // Render markdown with code block separation
  const renderBlocks = (text: string) => {
    // Split by code blocks
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Preceding normal text
      if (matchIndex > lastIndex) {
        const textChunk = text.slice(lastIndex, matchIndex);
        elements.push(
          <div key={`text-${lastIndex}`} className="space-y-2">
            {renderFormattedText(textChunk)}
          </div>
        );
      }

      // Code block
      const language = match[1] || 'text';
      const code = match[2] || '';
      elements.push(
        <CodeBlock key={`code-${matchIndex}`} language={language} code={code} />
      );

      lastIndex = matchIndex + match[0].length;
    }

    // Trailing text
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      // Check if there is an unclosed code block during active streaming
      if (remaining.includes('```')) {
        const parts = remaining.split('```');
        if (parts[0]) {
          elements.push(
            <div key={`trailing-pre-${lastIndex}`} className="space-y-2">
              {renderFormattedText(parts[0])}
            </div>
          );
        }
        const openCode = parts.slice(1).join('```');
        const firstLineBreak = openCode.indexOf('\n');
        const streamLang = firstLineBreak !== -1 ? openCode.slice(0, firstLineBreak).trim() : '';
        const streamCode = firstLineBreak !== -1 ? openCode.slice(firstLineBreak + 1) : openCode;

        elements.push(
          <CodeBlock
            key={`code-streaming-${lastIndex}`}
            language={streamLang || 'text'}
            code={streamCode}
            isStreaming={isStreaming}
          />
        );
      } else {
        elements.push(
          <div key={`text-tail-${lastIndex}`} className="space-y-2">
            {renderFormattedText(remaining)}
          </div>
        );
      }
    }

    return elements;
  };

  return (
    <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-100 space-y-3 font-normal break-words">
      {renderBlocks(content)}
    </div>
  );
};

const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  const renderedLines: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table Row detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) {
        // Divider row, skip
        return;
      }
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      // Flush table
      renderedLines.push(renderTable(tableRows, `table-${index}`));
      tableRows = [];
      inTable = false;
    }

    if (!trimmed) {
      renderedLines.push(<div key={`spacer-${index}`} className="h-1.5" />);
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      renderedLines.push(
        <h4 key={`h3-${index}`} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 mb-1">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      renderedLines.push(
        <h3 key={`h2-${index}`} className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      renderedLines.push(
        <h2 key={`h1-${index}`} className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1">
          {formatInline(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // Bullet list
      renderedLines.push(
        <div key={`li-${index}`} className="flex items-start gap-2 pl-2">
          <span className="text-blue-500 font-bold shrink-0 text-xs mt-1">•</span>
          <span className="flex-1">{formatInline(trimmed.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      // Numbered list
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        renderedLines.push(
          <div key={`oli-${index}`} className="flex items-start gap-2 pl-2">
            <span className="text-blue-500 font-medium font-mono text-xs mt-0.5 shrink-0">
              {numMatch[1]}.
            </span>
            <span className="flex-1">{formatInline(numMatch[2])}</span>
          </div>
        );
      }
    } else {
      // Normal paragraph
      renderedLines.push(
        <p key={`p-${index}`} className="leading-relaxed">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  if (inTable && tableRows.length > 0) {
    renderedLines.push(renderTable(tableRows, 'table-end'));
  }

  return renderedLines;
};

const renderTable = (rows: string[][], key: string) => {
  if (rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(1);

  return (
    <div key={key} className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
          <tr>
            {header.map((col, idx) => (
              <th key={idx} className="px-3 py-2">
                {formatInline(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {body.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-100/40 dark:hover:bg-slate-800/40 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                  {formatInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Inline parser for bold, italic, inline code
const formatInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[11px] border border-slate-200 dark:border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const CodeBlock: React.FC<{
  language: string;
  code: string;
  isStreaming?: boolean;
}> = ({ language, code, isStreaming }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="uppercase text-[11px] font-semibold tracking-wider text-slate-300">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Copy Code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 text-xs font-mono overflow-x-auto text-slate-200 leading-relaxed scrollbar-thin">
        <code>{code}</code>
        {isStreaming && <span className="streaming-cursor bg-blue-400" />}
      </pre>
    </div>
  );
};
