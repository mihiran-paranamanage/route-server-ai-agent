import { CSVRow, URLData, URL, URLDataPerSubsidiaryLanguage } from '../types.js';
import {
  AUTOMATED_FILTER_PAGES,
  LANGUAGE_DUTCH,
  LANGUAGE_ENGLISH,
  LANGUAGE_FRENCH,
  LANGUAGE_GERMAN
} from '../constants.js';

export const filterCsvData = (data: CSVRow[], route: string): CSVRow[] => {
  return data.filter(
    (row: CSVRow) =>
      row.PRESENTATION_FORMAT.replace(/['"]/g, '').trim() === 'Filter presentation' &&
      (row.URL_DUTCH === route || row.URL_DUTCH.startsWith(`${route}/`))
  );
};

export const getURLs = (dataNL: CSVRow[], dataBE: CSVRow[], dataDE: CSVRow[]): URLDataPerSubsidiaryLanguage => {
  const urlsNL = {
    nl: [] as URLData[],
    en: [] as URLData[],
  };
  const urlsBE = {
    nl: [] as URLData[],
    fr: [] as URLData[],
    en: [] as URLData[],
  };
  const urlsDE = {
    de: [] as URLData[],
    en: [] as URLData[],
  };

  for (const row of dataNL) {
    if (row.LANGUAGE === LANGUAGE_ENGLISH) {
      urlsNL.en.push({ language: 'en', url: `https://coolblue.nl/en${row.URL_TRANSLATED}`, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_DUTCH) {
      urlsNL.nl.push({ language: 'nl', url: `https://coolblue.nl${row.URL_TRANSLATED}`, nodeId: row.NODE_ID });
    }
  }

  for (const row of dataBE) {
    if (row.LANGUAGE === LANGUAGE_ENGLISH) {
      urlsBE.en.push({ language: 'en', url: `https://coolblue.be/en${row.URL_TRANSLATED}`, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_FRENCH) {
      urlsBE.fr.push({ language: 'fr', url: `https://coolblue.be/fr${row.URL_TRANSLATED}`, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_DUTCH) {
      urlsBE.nl.push({ language: 'nl', url: `https://coolblue.be/nl${row.URL_TRANSLATED}`, nodeId: row.NODE_ID });
    }
  }

  for (const row of dataDE) {
    if (row.LANGUAGE === LANGUAGE_ENGLISH) {
      urlsDE.en.push({ language: 'en', url: `https://coolblue.de/en${row.URL_TRANSLATED}`, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_GERMAN) {
      urlsDE.de.push({ language: 'de', url: `https://coolblue.de${row.URL_TRANSLATED}`, nodeId: row.NODE_ID });
    }
  }

  return {
    nl: urlsNL,
    be: urlsBE,
    de: urlsDE
  }
};

export const mapUrls = (urlDataPerSubsidiaryLanguage: URLDataPerSubsidiaryLanguage): URL[] => {
  const csvData: URL[] = [];

  for (const subsidiary of Object.keys(urlDataPerSubsidiaryLanguage)) {
    Object.entries(urlDataPerSubsidiaryLanguage[subsidiary]).forEach(([language, urlList]) => {
      urlList.forEach(urlData => {
        csvData.push({
          subsidiary,
          language,
          url: urlData.url,
          nodeId: urlData.nodeId,
          isMFE: isMFE(urlData.url) ? 'Y' : 'N'
        });
      });
    });
  }

  return csvData;
}

const isMFE = (url: string): boolean => {
  return !AUTOMATED_FILTER_PAGES.some(page => url.includes(`/${page}`));
}
