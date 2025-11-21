'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, X } from 'lucide-react';
import type { Note } from '@/types';

interface NoteViewerProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteViewer({ note, open, onOpenChange }: NoteViewerProps) {
  if (!note) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${note.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Georgia', serif;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { 
            color: #0077B6;
            margin-bottom: 10px;
            font-size: 28px;
            border-bottom: 3px solid #0077B6;
            padding-bottom: 10px;
          }
          .meta {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .tags {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
          }
          .tag {
            background: #0077B6;
            color: white;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 12px;
          }
          .content {
            margin-top: 30px;
            font-size: 16px;
          }
          .content h1 { font-size: 24px; margin: 20px 0 10px; }
          .content h2 { font-size: 20px; margin: 18px 0 8px; color: #06D6A0; }
          .content h3 { font-size: 18px; margin: 16px 0 6px; color: #00B4D8; }
          .content p { margin: 10px 0; }
          .content ul, .content ol { margin: 10px 0; padding-left: 30px; }
          .content li { margin: 5px 0; }
          .content blockquote { 
            border-left: 4px solid #0077B6; 
            padding-left: 15px; 
            margin: 15px 0;
            font-style: italic;
            color: #555;
          }
          .content code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${note.title}</h1>
        <div class="meta">
          <div><strong>Criado em:</strong> ${new Date(note.created_at).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</div>
          <div><strong>Atualizado em:</strong> ${new Date(note.updated_at).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</div>
          ${note.tags.length > 0 ? `
            <div class="tags">
              <strong>Tags:</strong>
              ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="content">${note.content}</div>
        <div class="footer">
          Gerado por Amorinha - Assistente Médica Pessoal 💙
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${note.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Georgia', serif;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #f9f9f9;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #0077B6;
            margin-bottom: 10px;
            font-size: 28px;
            border-bottom: 3px solid #0077B6;
            padding-bottom: 10px;
          }
          .meta {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
          }
          .tag {
            background: #0077B6;
            color: white;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 12px;
          }
          .content {
            margin-top: 30px;
            font-size: 16px;
          }
          .content h1 { font-size: 24px; margin: 20px 0 10px; }
          .content h2 { font-size: 20px; margin: 18px 0 8px; color: #06D6A0; }
          .content h3 { font-size: 18px; margin: 16px 0 6px; color: #00B4D8; }
          .content p { margin: 10px 0; }
          .content ul, .content ol { margin: 10px 0; padding-left: 30px; }
          .content li { margin: 5px 0; }
          .content blockquote { 
            border-left: 4px solid #0077B6; 
            padding-left: 15px; 
            margin: 15px 0;
            font-style: italic;
            color: #555;
          }
          .content code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${note.title}</h1>
          <div class="meta">
            <div><strong>Criado em:</strong> ${new Date(note.created_at).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</div>
            <div><strong>Atualizado em:</strong> ${new Date(note.updated_at).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</div>
            ${note.tags.length > 0 ? `
              <div class="tags">
                <strong>Tags:</strong>
                ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="content">${note.content}</div>
          <div class="footer">
            Gerado por Amorinha - Assistente Médica Pessoal 💙
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{note.title}</DialogTitle>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>Criado: {new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
                <span>•</span>
                <span>Atualizado: {new Date(note.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex gap-2 border-b pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </DialogContent>
    </Dialog>
  );
}

