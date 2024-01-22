const PATH = require('path');
const FS = require('fs');
const FS_PROMISES = require('fs/promises');
const STYLES_FOLDER = PATH.join(__dirname, 'styles');
const WRITE_STREAM = FS.createWriteStream(
  PATH.join(__dirname, 'project-dist/bundle.css'),
  'utf-8',
);

const WRITE_FILE = (fileName) => {
  const READ_STREAM = FS.createReadStream(fileName, 'utf-8');

  READ_STREAM.on('data', (chunk) => WRITE_STREAM.write(chunk));
};

const INFO_FOLDER = async (nameFolder) => {
  const FILES = await FS_PROMISES.readdir(nameFolder, { withFileTypes: true });

  FILES.forEach((elem) => {
    if (elem.isFile() && PATH.extname(elem.name) === '.css') {
      WRITE_FILE(PATH.join(nameFolder, elem.name));
    } else if (elem.isDirectory()) {
      INFO_FOLDER(PATH.join(nameFolder, elem.name));
    }
  });
};

INFO_FOLDER(STYLES_FOLDER);
