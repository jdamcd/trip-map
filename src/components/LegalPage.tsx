import { useEffect } from 'react';
import Markdown from 'react-markdown';
import privacyMd from '../content/privacy.md?raw';
import termsMd from '../content/terms.md?raw';

const content = {
  privacy: privacyMd,
  terms: termsMd,
};

const components = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-3 text-gray-700 dark:text-gray-300 space-y-1" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
  ),
};

export function LegalPage({ page }: { page: 'privacy' | 'terms' }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
      <a
        href="#"
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
      >
        &larr; Back to tripm.app
      </a>

      <div className="mt-6">
        <Markdown components={components}>{content[page]}</Markdown>
      </div>
    </main>
  );
}
