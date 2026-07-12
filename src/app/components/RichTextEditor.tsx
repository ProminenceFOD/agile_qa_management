import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '150px',
}: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'blockquote',
    'code-block',
    'link',
  ];

  return (
    <div className="rich-text-editor">
      <style>{`
        .rich-text-editor .quill {
          background: white;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border: none;
          border-bottom: 1px solid rgb(229 231 235);
          background: rgb(249 250 251);
        }
        .rich-text-editor .ql-container {
          border: none;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-size: 0.875rem;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgb(156 163 175);
          font-style: normal;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: rgb(75 85 99);
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: rgb(75 85 99);
        }
        .rich-text-editor .ql-snow .ql-picker-label {
          color: rgb(75 85 99);
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button:focus,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: rgb(79 70 229);
        }
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: rgb(79 70 229);
        }
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button:focus .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: rgb(79 70 229);
        }
        .dark .rich-text-editor .quill {
          background: rgb(31 41 55);
          border-color: rgb(75 85 99);
        }
        .dark .rich-text-editor .ql-toolbar {
          background: rgb(55 65 81);
          border-bottom-color: rgb(75 85 99);
        }
        .dark .rich-text-editor .ql-editor {
          color: rgb(243 244 246);
        }
        .dark .rich-text-editor .ql-snow .ql-stroke {
          stroke: rgb(209 213 219);
        }
        .dark .rich-text-editor .ql-snow .ql-fill {
          fill: rgb(209 213 219);
        }
        .dark .rich-text-editor .ql-snow .ql-picker-label {
          color: rgb(209 213 219);
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
