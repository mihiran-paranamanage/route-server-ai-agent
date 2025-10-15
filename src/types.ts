// CSV Types

export type CSVRow = {
  NODE_ID: string;
  PRESENTATION_FORMAT: string;
  LANGUAGE: string;
  URL_DUTCH: string;
  URL_TRANSLATED: string;
};

// URL Types

export type URLData = {
  language: string;
  url: string;
  nodeId: string;
};

export type URLDataPerSubsidiaryLanguage = {
  [subsidiary: string]: {
    [language: string]: URLData[];
  }
};

export type URL = {
  subsidiary: string;
  language: string;
  url: string;
  nodeId: string;
  isMFE: string;
};

// Route Types

export type RouteData = {
  language: string;
  subsidiary: string;
  path: string;
  nodeId: string;
};

export type RouteDataPerSubsidiaryLanguage = {
  [subsidiary: string]: {
    [language: string]: RouteData[];
  }
}

export type RouteDataForOutputRoutes = {
  name: string;
  paths: RoutePaths;
  targetPath: string;
  audience: RouteAudience;
}

export type RoutePathAndTargetPath = {
  path: string,
  targetPath: string
}

export type Routes = {
  [name: string]: {
    paths: RoutePaths;
    targetPath: string;
    audience: RouteAudience;
  }
}

type RoutePaths = {
  [subsidiary: string]: {
    [language: string]: string;
  }
}

type RouteAudience = {
  excluded: number[];
}
