// deepl-translator-tool (Next.js + Vercel + DeepL)
// File: pages/index.tsx

import { useState } from 'react';

const LANGUAGES = [
  'nl_NL', 'en_US', 'de_DE', 'fr_FR', 'it_IT', 'da_DK', 'es_ES', 'sv_SE', 'fi_FI', 'pl_PL',
  'de_AT', 'de_CH', 'nl_BE', 'nb_NO', 'fr_CH', 'fr_BE', 'en_GB', 'en_IE'
];

type TranslationRow = {
  string: string;
  translations: Record<string, string>;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strings: input.split('\n').filter(Boolean), languages: LANGUAGES }),
    });
    const data = await res.json();
    setTranslations(data);
    setLoading(false);
  };

  const handleChange = (i: number, lang: string, value: string) => {
    const newTranslations = [...translations];
    newTranslations[i].translations[lang] = value;
    setTranslations(newTranslations);
  };

  const downloadCSV = (type: 'al' | 'dl') => {
    const dlLangs = ['nl_NL', 'nl_BE', 'fr_BE', 'fr_FR'];
    const alHeader = ['string', 'location/module', 'frontend/backend', ...LANGUAGES.map(l => `translation ${l}`)];
    const dlHeader = ['string', 'location/module', 'frontend/backend', ...dlLangs.map(l => `translation ${l}`)];
    const rows = translations.map(t => {
      const base = [t.string, 'magento_2', 'frontend'];
      const langs = (type === 'al' ? LANGUAGES : dlLangs).map(lang => t.translations[lang] || '');
      return [...base, ...langs];
    });
    const csv = [type === 'al' ? alHeader : dlHeader, ...rows]
      .map(r => r.join(';'))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `translations_${type}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DeepL Magento Translation Tool</h1>
      <textarea
        className="w-full border p-2 mb-4 h-32"
        placeholder="Enter English strings (one per line)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleTranslate}
        disabled={loading}
      >
        {loading ? 'Translating...' : 'Translate'}
      </button>

      {translations.length > 0 && (
        <div className="mt-6">
          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-1">String</th>
                {LANGUAGES.map(lang => (
                  <th key={lang} className="border p-1">{lang}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {translations.map((row, i) => (
                <tr key={i}>
                  <td className="border p-1 font-semibold w-48 align-top">{row.string}</td>
                  {LANGUAGES.map(lang => (
                    <td key={lang} className="border p-1">
                      <textarea
                        className="w-full min-h-[60px] border px-1 text-sm resize-y"
                        value={row.translations[lang] || ''}
                        onChange={(e) => handleChange(i, lang, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-x-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => downloadCSV('al')}>Download AL CSV</button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={() => downloadCSV('dl')}>Download DL CSV</button>
          </div>
        </div>
      )}
    </div>
  );
}

import type { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const authHeader = context.req.headers.authorization;

  const USERNAME = process.env.BASIC_AUTH_USER;
  const PASSWORD = process.env.BASIC_AUTH_PASS;

  if (!authHeader) {
    return {
      props: {},
      redirect: {
        destination: '/api/auth',
        permanent: false,
      },
    };
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString();
  const [user, pass] = credentials.split(':');

  if (user !== USERNAME || pass !== PASSWORD) {
    return {
      props: {},
      redirect: {
        destination: '/api/auth',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
