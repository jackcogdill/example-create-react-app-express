const express = require('express');
const path = require('path');
const glob = require('glob');
const argv = require('minimist')(process.argv.slice(2));
const sort = require('./sort');

const app = express();
const port = process.env.PORT || 5000;

const rootDir = argv.dir || argv.R;
if (rootDir !== undefined) {
  // Serve files from specified root directory
  app.use('/', express.static(rootDir));
}

const mangaDir = argv['manga-dir'] || argv.M;
if (mangaDir === undefined) {
  console.log('No manga directory specified.');
  process.exit(1);
}
// Serve images from specified directory
app.use('/images', express.static(mangaDir));

const findImages = () => {
  const formats = ['jpg', 'jpeg', 'gif', 'png', 'tiff', 'bmp'];
  const pattern = `*@(${formats.join('|')})`;
  const options = {
    cwd: mangaDir,
    matchBase: true,
  };
  // matchBase is equivalent to **/patt

  glob(pattern, options, (err, files) => {
    files.sort(sort.numCompare);
    global.files = files;
  });
};

findImages();
const inbounds = n => n >= 0 && n < global.files.length;

app.get('/api/manga', (req, res) => {
  const { n: strN } = req.query;
  const n = Number(strN);

  if (!inbounds(n)) {
    res.send({
      error: `No such file index: ${n}`,
    });
    return;
  }

  const image = global.files[n];
  const p = path.parse(image);
  const header = p.dir ? `${p.dir}/${p.name}` : p.name;

  res.send({
    file: encodeURIComponent(image),
    title: p.name,
    header,
    hasPrev: inbounds(n - 1),
    hasNext: inbounds(n + 1),
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
