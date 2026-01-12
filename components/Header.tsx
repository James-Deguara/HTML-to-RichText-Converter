
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 mb-2">
        HTML &lt;&gt; Rich Text Sync
      </h1>
      <p className="text-lg text-gray-600">
        Instantly see your formatted text as clean HTML, and vice-versa.
      </p>
    </header>
  );
};

export default Header;