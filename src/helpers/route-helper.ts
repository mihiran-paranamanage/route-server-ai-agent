import {
  CSVRow,
  Routes,
  RouteData,
  RouteDataPerSubsidiaryLanguage,
  RouteDataForOutputRoutes, RoutePathAndTargetPath
} from '../types.js';
import { LANGUAGE_DUTCH, LANGUAGE_ENGLISH, LANGUAGE_FRENCH, LANGUAGE_GERMAN } from '../constants.js';

export const getRouteData = (dataNL: CSVRow[], dataBE: CSVRow[], dataDE: CSVRow[]): RouteDataPerSubsidiaryLanguage => {
  const routesNL = {
    nl: [] as RouteData[],
    en: [] as RouteData[],
  };
  const routesBE = {
    nl: [] as RouteData[],
    fr: [] as RouteData[],
    en: [] as RouteData[],
  };
  const routesDE = {
    de: [] as RouteData[],
    en: [] as RouteData[],
  };

  for (const row of dataNL) {
    if (row.LANGUAGE === LANGUAGE_ENGLISH) {
      routesNL.en.push({ language: 'en', subsidiary: 'nl', path: row.URL_TRANSLATED, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_DUTCH) {
      routesNL.nl.push({ language: 'nl', subsidiary: 'nl', path: row.URL_TRANSLATED, nodeId: row.NODE_ID });
    }
  }

  for (const row of dataBE) {
    if (row.LANGUAGE === LANGUAGE_ENGLISH) {
      routesBE.en.push({ language: 'en', subsidiary: 'be', path: row.URL_TRANSLATED, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_FRENCH) {
      routesBE.fr.push({ language: 'fr', subsidiary: 'be', path: row.URL_TRANSLATED, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_DUTCH) {
      routesBE.nl.push({ language: 'nl', subsidiary: 'be', path: row.URL_TRANSLATED, nodeId: row.NODE_ID });
    }
  }

  for (const row of dataDE) {
    if (row.LANGUAGE === LANGUAGE_ENGLISH) {
      routesDE.en.push({ language: 'en', subsidiary: 'de', path: row.URL_TRANSLATED, nodeId: row.NODE_ID });

      continue;
    }

    if (row.LANGUAGE === LANGUAGE_GERMAN) {
      routesDE.de.push({ language: 'de', subsidiary: 'de', path: row.URL_TRANSLATED, nodeId: row.NODE_ID });
    }
  }

  return {
    nl: routesNL,
    be: routesBE,
    de: routesDE
  }
};

export const buildRoutes = (routeDataPerSubsidiaryLanguage: RouteDataPerSubsidiaryLanguage): Routes => {
  const routes: Routes = {};

  for (const subsidiary of Object.keys(routeDataPerSubsidiaryLanguage)) {
    Object.entries(routeDataPerSubsidiaryLanguage[subsidiary]).forEach(([_, routeData]) => {
      routeData.forEach(routeData => {
        const data = getRouteDataForOutputRoutes(routeData);

        routes[data.name] = {
          paths: data.paths,
          targetPath: data.targetPath,
          audience: data.audience
        }
      });
    });
  }

  return routes;
}

const getRouteDataForOutputRoutes = (routeData: RouteData): RouteDataForOutputRoutes => {
  const { path, targetPath } = buildPathAndTargetPath(routeData.path);

  return {
    name: `preCart.100-percent.filter.${routeData.nodeId}-${routeData.language}-${routeData.subsidiary}`,
    paths: {
      [routeData.subsidiary]: {
        [routeData.language]: path
      },
    },
    targetPath: targetPath,
    audience: {
      excluded: [2]
    }
  };
}

const buildPathAndTargetPath = (routePath: string): RoutePathAndTargetPath => {
  let path = '';
  let targetPath = '/filter';

  const segments = routePath.split('/').filter(segment => segment.length > 0);

  const index = 1;
  for (const segment of segments) {
    path += `/:slug${index}(${segment})`;
    targetPath += `/:slug${index}`;
  }

  path += '/:slugs([^/]+:[^/]+)*';
  targetPath += '/:slugs*';

  return {
    path,
    targetPath
  };
}
