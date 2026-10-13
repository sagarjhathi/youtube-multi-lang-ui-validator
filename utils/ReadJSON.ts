import * as fs from 'fs';

export function readJson(fileName: string) {
  return JSON.parse(fs.readFileSync('data/' + fileName, 'utf-8'));
}

export function writeJson(fileName: string, data: unknown) {
  fs.writeFileSync('data/' + fileName, JSON.stringify(data, null, 2), 'utf-8');
}
