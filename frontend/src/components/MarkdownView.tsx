import React from "react";

function formatInline(text: string): React.ReactNode[] {
  // Parse **bold** and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-bone">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-graphite border border-rule text-xs text-bone font-mono"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote
          key={`bq-${elements.length}`}
          className="border-l-2 border-ash/40 pl-4 py-1 text-ash text-sm italic my-2 space-y-1"
        >
          {blockquoteLines.map((line, i) => (
            <p key={i}>{formatInline(line)}</p>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith(">")) {
      inBlockquote = true;
      blockquoteLines.push(trimmed.replace(/^>\s?/, ""));
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-base font-bold text-bone font-heading pt-2 pb-1"
        >
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-lg font-bold text-bone font-heading pt-3 pb-1"
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="text-xl font-bold text-bone font-heading pt-3 pb-1"
        >
          {trimmed.slice(2)}
        </h1>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 text-sm text-ash leading-relaxed">
            <span className="text-bone font-medium shrink-0">{match[1]}</span>
            <div>{formatInline(match[2])}</div>
          </div>
        );
      }
    } else if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ")) {
      const checked = trimmed.startsWith("- [x] ");
      const text = trimmed.slice(6);
      elements.push(
        <div key={i} className="flex items-start gap-2 text-sm text-ash">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 shrink-0 accent-bone"
          />
          <span className={checked ? "line-through opacity-70" : ""}>
            {formatInline(text)}
          </span>
        </div>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-sm text-ash">
          <span className="text-ash shrink-0 mt-0.5">•</span>
          <div>{formatInline(trimmed.slice(2))}</div>
        </div>
      );
    } else {
      elements.push(
        <p key={i} className="text-sm text-ash leading-relaxed">
          {formatInline(trimmed)}
        </p>
      );
    }
  }

  flushBlockquote();

  return <div className="space-y-3">{elements}</div>;
}

export default MarkdownView;
