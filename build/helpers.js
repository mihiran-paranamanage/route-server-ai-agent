import { createReadStream, createWriteStream } from 'fs';
import * as fs from 'node:fs';
import csv from 'csv-parser';
const LANGUAGE_DUTCH = 'Dutch';
const LANGUAGE_ENGLISH = 'English';
const LANGUAGE_FRENCH = 'French';
const LANGUAGE_GERMAN = 'German';
const AUTOMATED_FILTER_PAGES = [
    'geschikt-voor',
    'suitable-for',
    'convient-a',
    'passend-fuer',
    'top-10',
    'aanbieding',
    'promotion',
    'offre',
    'angebot',
    'tweedekans',
    'second-chance',
    'deuxieme-chance',
    'zweite-chance',
    'coolblues-keuze',
    'coolblues-choice',
    'choix-coolblue',
    'coolblue-favorit'
];
export async function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        if (!fs.existsSync(filePath)) {
            reject(new Error(`File not found: ${filePath}`));
            return;
        }
        createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}
export const filterCsvData = (data, route) => {
    return data.filter((row) => row.PRESENTATION_FORMAT.replace(/['"]/g, '').trim() === 'Filter presentation' &&
        (row.URL_DUTCH === route || row.URL_DUTCH.startsWith(`${route}/`)));
};
export const getURLs = (dataNL, dataBE, dataDE) => {
    const urlsNL = {
        nl: [],
        en: [],
    };
    const urlsBE = {
        nl: [],
        fr: [],
        en: [],
    };
    const urlsDE = {
        de: [],
        en: [],
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
    };
};
export const mapUrlsToCSV = (urls) => {
    const csvData = [];
    Object.entries(urls.nl).forEach(([lang, urlList]) => {
        urlList.forEach(urlData => {
            csvData.push({
                subsidiary: 'nl',
                language: lang,
                url: urlData.url,
                nodeId: urlData.nodeId,
                mfe: shouldBeInMFE(urlData.url)
            });
        });
    });
    Object.entries(urls.be).forEach(([lang, urlList]) => {
        urlList.forEach(urlData => {
            csvData.push({
                subsidiary: 'be',
                language: lang,
                url: urlData.url,
                nodeId: urlData.nodeId,
                mfe: shouldBeInMFE(urlData.url)
            });
        });
    });
    Object.entries(urls.de).forEach(([lang, urlList]) => {
        urlList.forEach(urlData => {
            csvData.push({
                subsidiary: 'de',
                language: lang,
                url: urlData.url,
                nodeId: urlData.nodeId,
                mfe: shouldBeInMFE(urlData.url)
            });
        });
    });
    return csvData;
};
export async function writeCSVFile(filePath, data, headers) {
    return new Promise((resolve, reject) => {
        try {
            const writeStream = createWriteStream(filePath);
            writeStream.write(headers.join(',') + '\n');
            for (const row of data) {
                if (typeof row === 'object' && row !== null) {
                    const values = Object.values(row).map(value => {
                        const stringValue = String(value || '');
                        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                            return `"${stringValue.replace(/"/g, '""')}"`;
                        }
                        return stringValue;
                    });
                    writeStream.write(values.join(',') + '\n');
                }
                else {
                    writeStream.write(String(row) + '\n');
                }
            }
            writeStream.end();
            writeStream.on('finish', () => resolve());
            writeStream.on('error', (error) => reject(error));
        }
        catch (error) {
            reject(error);
        }
    });
}
const shouldBeInMFE = (url) => {
    return AUTOMATED_FILTER_PAGES.some(page => url.includes(`/${page}`)) ? 'no' : 'yes';
};
