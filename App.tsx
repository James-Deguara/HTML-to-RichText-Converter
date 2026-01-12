
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import RichTextEditor from './components/RichTextEditor';
import HtmlEditor from './components/HtmlEditor';

const INITIAL_CONTENT = `<h1>Welcome to the Sync Editor!</h1>
<p>This is a demonstration of a <strong>bidirectional editor</strong>. You can edit the rich text on the left, or the raw HTML on the right.</p>
<p><br></p>
<p>Try some things:</p>
<ul>
    <li>Change the <span style="color: rgb(230, 0, 0);">color</span> of this text.</li>
    <li>Make a word <em>italic</em> or <u>underlined</u>.</li>
    <li>Add a new heading or a list item.</li>
</ul>
<p><br></p>
<p>Your changes will be reflected in the other panel <em>instantly</em>.</p>`;


function App() {
  const [content, setContent] = useState<string>(INITIAL_CONTENT);
  const [isRichTextCopied, setIsRichTextCopied] = useState(false);
  const [isHtmlCopied, setIsHtmlCopied] = useState(false);

  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([INITIAL_CONTENT]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isNavigatingHistory = useRef(false);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    // If the content change was due to an undo/redo, don't create a new history entry.
    if (isNavigatingHistory.current) {
      isNavigatingHistory.current = false;
      return;
    }

    // Clear the previous debounce timer on every content change
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer to save the state to history after a delay
    debounceTimer.current = window.setTimeout(() => {
      // If we've undone, and then typed something new, we should clear the "redo" history
      const newHistory = history.slice(0, historyIndex + 1);
      
      // Don't add to history if content is unchanged
      if (newHistory[newHistory.length - 1] === content) {
        return;
      }

      newHistory.push(content);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }, 500); // 500ms debounce delay

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [content, history, historyIndex]);


  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isNavigatingHistory.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isNavigatingHistory.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;


  const copyContent = (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState(true);
      setTimeout(() => {
        setCopiedState(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleCopyRichText = () => {
    try {
      const htmlBlob = new Blob([content], { type: 'text/html' });
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });

      navigator.clipboard.write([clipboardItem]).then(() => {
        setIsRichTextCopied(true);
        setTimeout(() => {
          setIsRichTextCopied(false);
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy rich text, falling back to plain text:', err);
        copyContent(plainText, setIsRichTextCopied);
      });
    } catch (err) {
      console.error('ClipboardItem API not supported, falling back to plain text.', err);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      copyContent(plainText, setIsRichTextCopied);
    }
  };

  const UndoRedoButton = ({ onClick, disabled, children }: { onClick: () => void, disabled: boolean, children: React.ReactNode }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-blue-600">
                <span className="mr-2">📝</span>Rich Text Editor
              </h2>
              <div className="flex items-center gap-x-2">
                <UndoRedoButton onClick={handleUndo} disabled={!canUndo}>Undo</UndoRedoButton>
                <UndoRedoButton onClick={handleRedo} disabled={!canRedo}>Redo</UndoRedoButton>
                <button
                  onClick={handleCopyRichText}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                  Copy Text
                </button>
                <span className={`w-16 text-green-600 font-semibold transition-opacity duration-300 ${isRichTextCopied ? 'opacity-100' : 'opacity-0'}`}>
                  Copied!
                </span>
              </div>
            </div>
            <div>
              <RichTextEditor value={content} onChange={handleContentChange} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-green-600">
                <span className="mr-2">&lt;/&gt;</span> HTML Source
              </h2>
               <div className="flex items-center gap-x-2">
                <UndoRedoButton onClick={handleUndo} disabled={!canUndo}>Undo</UndoRedoButton>
                <UndoRedoButton onClick={handleRedo} disabled={!canRedo}>Redo</UndoRedoButton>
                <button
                  onClick={() => copyContent(content, setIsHtmlCopied)}
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                  Copy HTML
                </button>
                 <span className={`w-16 text-green-600 font-semibold transition-opacity duration-300 ${isHtmlCopied ? 'opacity-100' : 'opacity-0'}`}>
                  Copied!
                </span>
              </div>
            </div>
            <div>
              <HtmlEditor value={content} onChange={handleContentChange} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
