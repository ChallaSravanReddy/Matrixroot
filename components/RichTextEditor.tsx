"use client";

import React, { useRef, useEffect } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Type
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content only once to prevent cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!value) {
        editorRef.current.innerHTML = "";
      } else if (editorRef.current.innerHTML === "" || value !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    title,
    isActive = false
  }: { 
    onClick: () => void; 
    icon: any; 
    title: string;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded hover:bg-[#8B4513]/10 transition-colors ${
        isActive ? "bg-[#8B4513]/20 text-[#8B4513]" : "text-[#3D2B1F]/70 hover:text-[#3D2B1F]"
      }`}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] overflow-hidden focus-within:border-[#8B4513] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#8B4513]/20 bg-white/50">
        <select 
          onChange={(e) => execCommand("formatBlock", e.target.value)}
          className="bg-transparent text-xs text-[#3D2B1F] border border-[#8B4513]/20 rounded p-1 outline-none focus:border-[#8B4513]"
          defaultValue="P"
        >
          <option value="P">Normal</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
        </select>
        
        <select
          onChange={(e) => execCommand("fontSize", e.target.value)}
          className="bg-transparent text-xs text-[#3D2B1F] border border-[#8B4513]/20 rounded p-1 outline-none focus:border-[#8B4513] ml-1"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        <div className="w-px h-4 bg-[#8B4513]/20 mx-1" />

        <ToolbarButton onClick={() => execCommand("bold")} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => execCommand("italic")} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => execCommand("underline")} icon={Underline} title="Underline" />
        
        <div className="w-px h-4 bg-[#8B4513]/20 mx-1" />
        
        <ToolbarButton onClick={() => execCommand("justifyLeft")} icon={AlignLeft} title="Align Left" />
        <ToolbarButton onClick={() => execCommand("justifyCenter")} icon={AlignCenter} title="Align Center" />
        <ToolbarButton onClick={() => execCommand("justifyRight")} icon={AlignRight} title="Align Right" />
        
        <div className="w-px h-4 bg-[#8B4513]/20 mx-1" />
        
        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={ListOrdered} title="Numbered List" />
      </div>

      {/* Editor Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto text-xs text-[#3D2B1F] outline-none prose prose-sm prose-p:my-1 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-ul:list-disc prose-ol:list-decimal prose-ul:ml-4 prose-ol:ml-4"
        style={{ whiteSpace: "pre-wrap" }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
