import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Checklist from '@editorjs/checklist';
import Table from '@editorjs/table';
import LinkTool from '@editorjs/link';
import type { EditorContent } from '../../../services/api';

interface EditorDicaProps {
  initialContent?: EditorContent;
  onChange: (content: EditorContent) => void;
  placeholder?: string;
}

const EditorDica: React.FC<EditorDicaProps> = ({
  initialContent,
  onChange,
  placeholder = 'Comece a escrever sua dica...'
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const editor = new EditorJS({
      holder: 'editor-dica',
      placeholder,
      data: initialContent || {
        blocks: []
      },
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
            placeholder: 'Digite o título...'
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: ['marker', 'inlineCode']
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+O',
          config: {
            quotePlaceholder: 'Digite a citação...',
            captionPlaceholder: 'Autor da citação'
          }
        },
        delimiter: Delimiter,
        image: {
          class: Image,
          config: {
            endpoints: {
              byFile: '/api/upload/image', // Implementar se necessário
              byUrl: '/api/upload/image-url', // Implementar se necessário
            },
            additionalRequestHeaders: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        },
        code: {
          class: Code,
          shortcut: 'CMD+SHIFT+C'
        },
        warning: {
          class: Warning,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+W',
          config: {
            titlePlaceholder: 'Título do aviso',
            messagePlaceholder: 'Mensagem do aviso'
          }
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+I'
        }
      },
      onChange: async () => {
        if (editorRef.current) {
          try {
            const outputData = await editorRef.current.save();
            onChange(outputData as EditorContent);
          } catch (error) {
            console.error('Erro ao salvar conteúdo do editor:', error);
          }
        }
      },
      onReady: () => {
        setIsReady(true);
        console.log('Editor.js está pronto!');
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [initialContent, onChange, placeholder]);

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Editor de Conteúdo
        </h3>
        <p className="text-xs text-gray-500">
          Use as ferramentas de formatação para criar um conteúdo rico e atrativo.
          {!isReady && ' Carregando editor...'}
        </p>
      </div>
      
      <div className="min-h-[400px] p-6">
        <div 
          id="editor-dica" 
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <p className="text-xs text-gray-500">
          <strong>Dicas:</strong> Use Ctrl+/ para ver todos os atalhos disponíveis. 
          Pressione Tab para navegar entre os blocos.
        </p>
      </div>
    </div>
  );
};

export default EditorDica;
