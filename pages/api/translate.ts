import type { NextApiRequest, NextApiResponse } from 'next';

const LANGUAGE_MAP: Record<string, string> = {
  nl_NL: 'NL',
  en_US: 'EN-US',
  de_DE: 'DE',
  fr_FR: 'FR',
  it_IT: 'IT',
  da_DK: 'DA',
  es_ES: 'ES',
  sv_SE: 'SV',
  fi_FI: 'FI',
  pl_PL: 'PL',
  de_AT: 'DE',
  de_CH: 'DE',
  nl_BE: 'NL',
  nb_NO: 'NB',
  fr_CH: 'FR',
  fr_BE: 'FR',
  en_GB: 'EN-GB',
  en_IE: 'EN-GB'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { strings, languages } = req.body;

  if (!Array.isArray(strings) || !Array.isArray(languages)) {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  const results: any[] = [];

  for (const str of strings) {
    const translations: Record<string, string> = {};

    const uniqueTargetLangs = [...new Set(languages.map(lang => LANGUAGE_MAP[lang]))];
    const baseTranslations: Record<string, string> = {};

    for (const targetLang of uniqueTargetLangs) {
      try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            text: str,
            target_lang: targetLang,
            preserve_formatting: '1',
            tag_handling: 'xml',
          }),
        });

    const data = await response.json();
    console.log(`[${targetLang}] "${str}" →`, JSON.stringify(data));

    baseTranslations[targetLang] = data?.translations?.[0]?.text || '';
      } catch (e) {
        baseTranslations[targetLang] = '';
      }
    }

    languages.forEach(lang => {
      const targetLang = LANGUAGE_MAP[lang] || 'EN';
      translations[lang] = baseTranslations[targetLang] || '';
    });

    results.push({
      string: str,
      translations,
    });
  }

  res.status(200).json(results);
}
