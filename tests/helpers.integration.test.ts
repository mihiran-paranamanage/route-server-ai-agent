import { describe, it, expect } from 'vitest';
import os from 'os';
import * as path from 'path';
import { readCSVFile, writeCSVFile, writeJSONFile } from '../src/helpers/file-helper.js';
import { filterCsvData, getURLs, mapUrls } from '../src/helpers/url-helper.js';
import { buildRoutes, getRouteData } from '../src/helpers/route-helper.js';

describe('file-helper', () => {
  describe('given input file exists', async () => {
    let csvData = await readCSVFile(path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'data', 'sitemap-data-nl-2025-09-21.csv'));

    it('reads and parse CSV file correctly', () => {
      expect(csvData.length).toBeGreaterThan(0);
      expect(csvData[0]).toEqual({
        NODE_ID: '46f89a3e-702c-4ae4-b7f3-fd396de7d359',
        PRESENTATION_FORMAT: 'Homepage presentation',
        LANGUAGE: 'English',
        TITLE: 'Coolblue.nl',
        TITLE_TRANSLATED: 'Coolblue.nl',
        BROWSER_TITLE_DUTCH: '',
        BROWSER_TITLE_TRANSLATED: '',
        META_DESCRIPTION_DUTCH: '',
        META_DESCRIPTION_TRANSLATED: '',
        URL_DUTCH: '/',
        URL_TRANSLATED: '/',
        URL_PARENT: '',
        URL_PARENT_TRANSLATED: '',
        PARENT_NODE_ID: '',
        CLOSED_COMMUNITY_ID: '',
        URL_INDEXABLE_TRANSLATED: 'Y',
        CONTENT_INDEXABLE_TRANSLATED: 'Y',
        HAS_PRODUCTS_TRANSLATED: 'N',
        TRANSLATED_PAGE_INDEXABLE: 'N',
        URL_INDEXABLE_DUTCH: 'Y',
        CONTENT_INDEXABLE_DUTCH: 'Y',
        HAS_PRODUCTS_DUTCH: 'N',
        CONTENT_TYPE: '',
        ALTERNATIVE_PAGES_GROUP_ID: '',
        EARLIEST_CHANGE_DATETIME: ''
      });
    });

    describe('given /pannen route exists', () => {
      it('filters data correctly', () => {
        csvData = filterCsvData(csvData, '/pannen');

        expect(csvData.length).toBe(176);
        expect(csvData[0]).toEqual({
          ALTERNATIVE_PAGES_GROUP_ID: '16095',
          BROWSER_TITLE_DUTCH: 'Aluminium pan',
          BROWSER_TITLE_TRANSLATED: 'Aluminum pan',
          CLOSED_COMMUNITY_ID: '',
          CONTENT_INDEXABLE_DUTCH: 'Y',
          CONTENT_INDEXABLE_TRANSLATED: 'Y',
          CONTENT_TYPE: 'Product type segment page',
          EARLIEST_CHANGE_DATETIME: '21-03-2018 15:52:52',
          HAS_PRODUCTS_DUTCH: 'Y',
          HAS_PRODUCTS_TRANSLATED: 'Y',
          LANGUAGE: 'English',
          META_DESCRIPTION_DUTCH: '',
          META_DESCRIPTION_TRANSLATED: '',
          NODE_ID: '1df92924-ce58-4e5a-89c3-85475ad441ec',
          PARENT_NODE_ID: '4693d7da-01b9-4d00-accc-3768091cd05f',
          PRESENTATION_FORMAT: 'Filter presentation',
          TITLE: 'Aluminium pannen',
          TITLE_TRANSLATED: 'Aluminum pans',
          TRANSLATED_PAGE_INDEXABLE: 'Y',
          URL_DUTCH: '/pannen/aluminium-pannen',
          URL_INDEXABLE_DUTCH: 'Y',
          URL_INDEXABLE_TRANSLATED: 'Y',
          URL_PARENT: '/pannen',
          URL_PARENT_TRANSLATED: '/pans',
          URL_TRANSLATED: '/pans/aluminum-pans',
        });
      });

      it('gets urls correctly', () => {
        const urlData = getURLs(csvData, [], []);

        expect(urlData.nl.nl.length).toBe(88);
        expect(urlData.nl.en.length).toBe(88);
        expect(urlData.be.nl.length).toBe(0);
        expect(urlData.be.fr.length).toBe(0);
        expect(urlData.be.en.length).toBe(0);
        expect(urlData.de.de.length).toBe(0);
        expect(urlData.de.en.length).toBe(0);

        expect(urlData.nl.nl[0]).toEqual({
          language: 'nl',
          nodeId: '45b0f142-76cc-49ad-a3b7-f058eb2f41ac',
          url: 'https://coolblue.nl/pannen/aanbieding',
        });

        expect(urlData.nl.en[0]).toEqual({
          language: 'en',
          nodeId: '1df92924-ce58-4e5a-89c3-85475ad441ec',
          url: 'https://coolblue.nl/en/pans/aluminum-pans',
        });
      });

      it('saves data correctly into a csv output', async () => {
        const urlData = getURLs(csvData, [], []);
        const urls = mapUrls(urlData);

        const outputFilePath = path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'urls', `route-data-test.csv`);
        await writeCSVFile(outputFilePath, urls, ['SUBSIDIARY', 'LANGUAGE', 'URL', 'NODE_ID']);

        const writtenData = await readCSVFile(outputFilePath);
        expect(writtenData.length).toBe(176);
      });
    });
  });
});

describe('url-helper', async () => {
  describe('given input files exists', () => {
    it('generates URLs correctly and saves into a CSV file', async () => {
      const route = '/televisielijsten';

      let dataNL = await readCSVFile(path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'data', 'sitemap-data-nl-2025-09-21.csv'));
      dataNL = filterCsvData(dataNL, route);

      let dataBE = await readCSVFile(path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'data', 'sitemap-data-be-2025-09-21.csv'));
      dataBE = filterCsvData(dataBE, route);

      let dataDE = await readCSVFile(path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'data', 'sitemap-data-de-2025-09-21.csv'));
      dataDE = filterCsvData(dataDE, route);

      const urlData = getURLs(dataNL, dataBE, dataDE);
      const urls = mapUrls(urlData);

      const timestamp = new Date().toISOString().split('T')[0];
      const outputFileName = `urls-televisielijsten-${timestamp}.csv`;
      const outputFilePath = path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'urls', outputFileName);
      await writeCSVFile(outputFilePath, urls, ['SUBSIDIARY', 'LANGUAGE', 'URL', 'NODE_ID', 'IS_MFE']);
    });
  });
});

describe('route-helper', async () => {
  describe('given input files exists', () => {
    it('generates routes correctly and saves into a JSON file', async () => {
      const route = '/televisielijsten';

      let dataNL = await readCSVFile(path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'data', 'sitemap-data-nl-2025-09-21.csv'));
      dataNL = filterCsvData(dataNL, route);

      let dataBE = await readCSVFile(path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'data', 'sitemap-data-be-2025-09-21.csv'));
      dataBE = filterCsvData(dataBE, route);

      let dataDE = await readCSVFile(path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'data', 'sitemap-data-de-2025-09-21.csv'));
      dataDE = filterCsvData(dataDE, route);

      const routeData = getRouteData(dataNL, dataBE, dataDE);
      const routes = buildRoutes(routeData);

      const timestamp = new Date().toISOString().split('T')[0];
      const outputFileName = `routes-televisielijsten-${timestamp}.json`;
      const outputFilePath = path.join(os.homedir(), 'Documents', 'generate-sitemap-routes', 'routes', outputFileName);
      await writeJSONFile(outputFilePath, routes);
    });
  });
});
