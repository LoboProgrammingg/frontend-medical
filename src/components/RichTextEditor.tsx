'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Eraser,
  Quote,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder || 'Digite sua anotação aqui...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] max-w-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const colors = [
    { name: 'Preto', value: '#000000' },
    { name: 'Vermelho', value: '#DC2626' },
    { name: 'Laranja', value: '#EA580C' },
    { name: 'Amarelo', value: '#CA8A04' },
    { name: 'Verde', value: '#16A34A' },
    { name: 'Azul', value: '#2563EB' },
    { name: 'Roxo', value: '#9333EA' },
    { name: 'Rosa', value: '#DB2777' },
  ];

  const highlights = [
    { name: 'Amarelo', value: '#FEF08A' },
    { name: 'Verde', value: '#BBF7D0' },
    { name: 'Azul', value: '#BFDBFE' },
    { name: 'Rosa', value: '#FBCFE8' },
    { name: 'Laranja', value: '#FED7AA' },
  ];

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
        {/* Formatação de Texto */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Sublinhado (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Títulos */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Listas */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Alinhamento */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Citação e Código */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Código"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Cores de Texto */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-muted-foreground mr-1">Cor:</span>
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => editor.chain().focus().setColor(color.value).run()}
              className="w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Destacar (Marca-texto) */}
        <div className="flex gap-1 items-center">
          <Highlighter className="h-4 w-4 text-muted-foreground mr-1" />
          {highlights.map((highlight) => (
            <button
              key={highlight.value}
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight({ color: highlight.value }).run()}
              className="w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: highlight.value }}
              title={`Destacar ${highlight.name}`}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Limpar Formatação */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Limpar formatação"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
        className="bg-background"
      />
    </div>
  );
}

