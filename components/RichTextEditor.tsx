"use client";

import React, { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    let quillInstance: any = null;

    const initQuill = async () => {
      const { default: Quill } = await import("quill");

      // Set up toolbar options
      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"]
      ];

      quillInstance = new Quill(containerRef.current!, {
        theme: "snow",
        placeholder: placeholder || "Compose notes here...",
        modules: {
          toolbar: toolbarOptions,
          clipboard: {
            matchVisual: false // Prevents Quill from adding extra empty paragraphs on paste
          }
        }
      });

      quillRef.current = quillInstance;

      // Unescape helper to fix any double-escaped HTML strings
      const unescapeHtml = (htmlStr: string) => {
        if (!htmlStr) return "";
        // If it starts with &lt; and contains escaped tags, parse it to actual HTML
        if (htmlStr.includes("&lt;") || htmlStr.includes("&gt;")) {
          const doc = new DOMParser().parseFromString(htmlStr, "text/html");
          return doc.documentElement.textContent || doc.body.textContent || htmlStr;
        }
        return htmlStr;
      };

      const cleanInitialValue = unescapeHtml(value || "");
      if (cleanInitialValue) {
        quillInstance.root.innerHTML = cleanInitialValue;
      }

      // Handle text changes
      quillInstance.on("text-change", () => {
        if (isUpdatingRef.current) return;

        const rawHtml = quillInstance.root.innerHTML;
        
        // Sanitize the HTML to keep it safe while preserving rich styling
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ADD_TAGS: ["table", "tr", "td", "th", "tbody", "thead", "colgroup", "col"],
          ADD_ATTR: ["target", "rel", "style", "class"],
          USE_PROFILES: { html: true }
        });

        isUpdatingRef.current = true;
        onChange(cleanHtml);
        isUpdatingRef.current = false;
      });
    };

    initQuill();

    return () => {
      // Clean up DOM if necessary, but letting React unmount is generally sufficient
    };
  }, [isMounted]);

  // Sync outside changes to Quill
  useEffect(() => {
    if (quillRef.current && !isUpdatingRef.current) {
      const currentVal = quillRef.current.root.innerHTML;
      if (value !== currentVal && value !== undefined) {
        isUpdatingRef.current = true;
        quillRef.current.root.innerHTML = value || "";
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

  return (
    <div className="w-full bg-white border border-black/10 rounded-[12px] overflow-hidden focus-within:border-black transition-colors shadow-sm">
      <div className="quill-wrapper">
        <div ref={containerRef} />
      </div>
    </div>
  );
}
