import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './shell.css';

function App() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/portfolio-template.html')
      .then((response) => {
        if (!response.ok) throw new Error(`Portfolio template returned ${response.status}`);
        return response.text();
      })
      .then((source) => {
        const parsed = new DOMParser().parseFromString(source, 'text/html');
        const scripts = [...parsed.querySelectorAll('script')].map((script) => script.textContent).filter(Boolean);
        parsed.querySelectorAll('script').forEach((script) => script.remove());
        if (active) setPage({ markup: parsed.body.innerHTML, scripts });
      })
      .catch((reason) => active && setError(reason.message));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!page) return;
    // The legacy portfolio scripts initialize the existing interactive sections and local Studio.
    for (const code of page.scripts) {
      const script = document.createElement('script');
      script.textContent = code;
      document.body.appendChild(script);
    }
  }, [page]);

  if (error) return <main className="app-error"><h1>Portfolio could not load</h1><p>{error}</p></main>;
  if (!page) return <main className="app-loading" aria-live="polite"><span className="loading-mark">♫</span><p>Preparing Monika’s portfolio…</p></main>;
  return <div className="portfolio-root" dangerouslySetInnerHTML={{ __html: page.markup }} />;
}

createRoot(document.getElementById('root')).render(<App />);
