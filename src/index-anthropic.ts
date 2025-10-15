import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as path from "path";
import os from 'os';
import { readCSVFile, writeCSVFile } from './helpers/file-helper.js';
import { filterCsvData, getURLs, mapUrls } from './helpers/url-helper.js';

const server = new McpServer(
  {
    name: "route-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {}
    },
  }
);

server.prompt(
  "extract-urls",
  "Extract URLs from a CSV file based on a given route",
  {
    route: z.string().describe("route to search for in the CSV file (e.g., /pannen, /laptops, etc.)")
  },
  async ({ route }) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Extract all URLs from the CSV file that match the route "${route}".
            Steps:
             1. Use read-route-data-from-csv tool to read the CSV file and filter rows that match the given route.
             2. Display the extracted URLs in the following format.
                - Number of NL URLs per each language (nl, en)
                - Number of BE URLs per each language (nl, fr, en)
                - Number of DE URLs per each language (de, en)
          `
        }
      }]
    };
  }
);

server.tool(
  "read-route-data-from-csv",
  "Read data from sitemap CSV files and filter rows that matched for the given route",
  {
    route: z.string().describe("Name of the route (e.g.: /pannen, /laptops, etc.)")
  },
  async ({ route }) => {
    try {
      let dataNL = await readCSVFile(path.join(os.homedir(), 'Documents', 'sitemap-data-nl-2025-09-21.csv'));
      dataNL = filterCsvData(dataNL, route);

      let dataBE = await readCSVFile(path.join(os.homedir(), 'Documents', 'sitemap-data-be-2025-09-21.csv'));
      dataBE = filterCsvData(dataBE, route);

      let dataDE = await readCSVFile(path.join(os.homedir(), 'Documents', 'sitemap-data-de-2025-09-21.csv'));
      dataDE = filterCsvData(dataDE, route);

      const urls = getURLs(dataNL, dataBE, dataDE);

      if (dataNL.length === 0 && dataBE.length === 0 && dataDE.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No matching rows found for route "${route}" in any CSV file.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            urls,
            text: `Data for route "${route}" based on subsidiary and languages:\n` + JSON.stringify(urls, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error processing CSV files: ${error instanceof Error ? error.message : 'Unknown error'}`
          },
        ],
      };
    }
  }
);

server.tool(
  "save-route-data-to-csv",
  "Save filtered route data to a CSV file with URLs organized by subsidiary and language",
  {
    urls: z.object({
      nl: z.object({
        nl: z.array(z.object({
          language: z.string(),
          url: z.string(),
          nodeId: z.string()
        })),
        en: z.array(z.object({
          language: z.string(),
          url: z.string(),
          nodeId: z.string()
        }))
      }),
      be: z.object({
        nl: z.array(z.object({
          language: z.string(),
          url: z.string(),
          nodeId: z.string()
        })),
        fr: z.array(z.object({
          language: z.string(),
          url: z.string(),
          nodeId: z.string()
        })),
        en: z.array(z.object({
          language: z.string(),
          url: z.string(),
          nodeId: z.string()
        }))
      }),
      de: z.object({
        de: z.array(z.object({
          language: z.string(),
          url: z.string(),
          nodeId: z.string()
        })),
        en: z.array(z.object({
          language: z.string(),
          url: z.string(),
          nodeId: z.string()
        }))
      })
    }).describe("URLs data structure returned from read-route-data-from-csv tool")
  },
  async ({ urls }) => {
    try {
      const hasData = Object.values(urls.nl).some(arr => arr.length > 0) ||
                     Object.values(urls.be).some(arr => arr.length > 0) ||
                     Object.values(urls.de).some(arr => arr.length > 0);

      if (!hasData) {
        return {
          content: [
            {
              type: "text",
              text: `No URL data provided.`,
            },
          ],
        };
      }

      const csvData = mapUrls(urls);

      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFileName = `route-data-${timestamp}.csv`;
      const outputFilePath = path.join(os.homedir(), 'Documents', defaultFileName);

      await writeCSVFile(outputFilePath, csvData, ['SUBSIDIARY', 'LANGUAGE', 'URL', 'NODE_ID', 'IS_MFE']);

      return {
        content: [
          {
            type: "text",
            text: `Successfully saved ${csvData.length} URLs to: ${outputFilePath}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error saving CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CSV Reader MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
