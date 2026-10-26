import React, { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = "Nhập nội dung mô tả chi tiết sản phẩm...",
  className = "",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  // Sync external content update (e.g. form reset or prefill)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "")
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const handleInsertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
  }

  return (
    <div
      className={`flex flex-col border border-input rounded-xl bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all ${className}`}
    >
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border text-foreground">
        {/* Headings & Paragraph */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Tiêu đề chính H1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Tiêu đề H2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Tiêu đề phụ H3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
            editor.isActive("paragraph")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Văn bản thông thường (P)"
        >
          P
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Text Styling */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`size-7 rounded-md flex items-center justify-center font-bold text-xs transition-colors ${
            editor.isActive("bold")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="In đậm (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`size-7 rounded-md flex items-center justify-center italic text-xs transition-colors ${
            editor.isActive("italic")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="In nghiêng (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`size-7 rounded-md flex items-center justify-center line-through text-xs transition-colors ${
            editor.isActive("strike")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Gạch ngang"
        >
          S
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`size-7 rounded-md flex items-center justify-center text-xs transition-colors ${
            editor.isActive("bulletList")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Danh sách gạch đầu dòng"
        >
          <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`size-7 rounded-md flex items-center justify-center text-xs transition-colors ${
            editor.isActive("orderedList")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Danh sách số"
        >
          <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`size-7 rounded-md flex items-center justify-center text-xs transition-colors ${
            editor.isActive("blockquote")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Đoạn trích dẫn"
        >
          <span className="material-symbols-outlined text-[16px]">format_quote</span>
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="size-7 rounded-md flex items-center justify-center text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Hoàn tác"
        >
          <span className="material-symbols-outlined text-[16px]">undo</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="size-7 rounded-md flex items-center justify-center text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Làm lại"
        >
          <span className="material-symbols-outlined text-[16px]">redo</span>
        </button>

        {/* Quick Plant Emojis */}
        <div className="ml-auto flex items-center gap-1 pl-2 border-l border-border">
          {["🌱", "🌿", "🍅", "🌸", "💧", "☀️"].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              className="size-6 rounded hover:bg-muted flex items-center justify-center text-xs transition-colors"
              title={`Chèn biểu tượng ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-3.5 min-h-[180px] max-h-[360px] overflow-y-auto text-sm leading-relaxed text-foreground cursor-text">
        <EditorContent editor={editor} className="outline-hidden" />
      </div>
    </div>
  )
}
