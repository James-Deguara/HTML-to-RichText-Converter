
import React from 'react';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ value, onChange }) => {
  const handleHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleHtmlChange}
      spellCheck="false"
      className="w-full p-4 rounded-md bg-white border border-gray-300 text-gray-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow duration-200"
      style={{ minHeight: '367px' }} // Match height of Quill editor
    />
  );
};

export default HtmlEditor;
