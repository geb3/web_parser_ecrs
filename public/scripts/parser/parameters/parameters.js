import fs from 'fs';

const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
export const parametersJson = loadJSON('./parameters.json');