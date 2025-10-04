import React, { KeyboardEvent } from "react";
import DOMPurify from "isomorphic-dompurify";

const highlightText = (text: string) => {
  const combinedRegex = /(https?:\/\/[^\s]+)|(#["\w-]+)/g;

  // 1. Escape HTML special characters to prevent XSS
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Use the combined regex to find and wrap matches with inline styles
  // Using inline styles with CSS variables to stay theme-aware
  const highlighted = escapedText.replace(combinedRegex, (match) => {
    if (match.startsWith("#")) {
      return `<span style="color: hsl(var(--accent-foreground)); background-color: hsl(var(--accent)); border-radius: 4px; padding: 1px 0px;">${match}</span>`;
    } else {
      return `<span style="color: hsl(var(--primary)); text-decoration: underline; text-decoration-color: hsl(var(--primary) / 0.5);">${match}</span>`;
    }
  });

  // 3. Preserve line breaks for the highlighter div
  return highlighted.replace(/\n/g, "<br />");
};

interface EditorProps {
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

function Editor({
  value,
  onChange,
  onKeyDown,
  placeholder,
  ...props
}: React.ComponentProps<"input">) {
  // Shared Tailwind classes for the textarea and the highlighter div
  const sharedClasses =
    "col-start-1 row-start-1 w-full min-h-[50px] p-2.5 m-0 bg-transparent border-none outline-none box-border whitespace-pre-wrap break-words font-inherit text-inherit leading-relaxed resize-none";

  return (
    <div className="border-border bg-background grid w-full border font-mono text-sm">
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`${sharedClasses} caret-foreground placeholder:text-muted-foreground z-10 text-transparent`}
        spellCheck="false"
        placeholder={placeholder}
        autoFocus
        rows={1}
        {...props}
      />
      <div
        className={`${sharedClasses} text-foreground pointer-events-none z-0`}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(highlightText(value) + " "),
        }} // Trailing space ensures last line is rendered and div grows
      />
    </div>
  );
}

export default Editor;
