export function parseLevel(text) {
  const lines = text.split(/\r?\n/);
  const meta = {};
  let i = 0;

  while (i < lines.length && lines[i].trim() !== '---') {
    const line = lines[i];
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if (key) meta[key] = value;
    }
    i++;
  }
  if (lines[i] && lines[i].trim() === '---') i++;

  const grid = [];
  for (; i < lines.length; i++) {
    if (lines[i].length > 0) grid.push(lines[i]);
  }

  const width = grid.reduce((m, l) => Math.max(m, l.length), 0);
  const height = grid.length;

  return { meta, grid, width, height };
}
