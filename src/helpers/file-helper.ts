import { CSVRow, Routes } from '../types.js';
import fs from 'node:fs';
import { createReadStream, createWriteStream } from 'fs';
import csv from 'csv-parser';

export async function readCSVFile(filePath: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

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

export async function writeCSVFile(filePath: string, data: any[], headers: string[]): Promise<void> {
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
        } else {
          writeStream.write(String(row) + '\n');
        }
      }

      writeStream.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
}

export async function writeJSONFile(filePath: string, data: Routes): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const writeStream = createWriteStream(filePath);

      writeStream.write(JSON.stringify(data, null, 2));

      writeStream.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
}
