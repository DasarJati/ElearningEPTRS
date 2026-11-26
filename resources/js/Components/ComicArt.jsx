import React, { useState } from 'react';

export default function ComicArt({ file, className, fallback = null }) {
  const [failedFile, setFailedFile] = useState(null);

  return failedFile === file ? fallback : (
    <img
      className={className}
      src={`/images/comic/${file}`}
      alt=""
      aria-hidden="true"
      decoding="async"
      onError={() => setFailedFile(file)}
    />
  );
}
