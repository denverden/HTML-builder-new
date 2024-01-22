const PATH = require('path');
const PROCESS = require('process');
const FS = require('fs/promises');

const SECRET_FOLDER = PATH.join(__dirname, 'secret-folder');

const INFO_FILES = async (fileName, nameFolder) => {
  const TYPE_FILE = PATH.extname(fileName).slice(1);
  const NAME_FILE = PATH.basename(fileName, TYPE_FILE).slice(0, -1);
  const LINK_FILE = PATH.join(nameFolder, fileName);
  const SIZE_FILE = ((await FS.stat(LINK_FILE)).size / 1024).toFixed(2);

  PROCESS.stdout.write(`${NAME_FILE} - ${TYPE_FILE} - ${SIZE_FILE} kb \n`);
};

const INFO_FOLDER = async (nameFolder) => {
  const FILES = await FS.readdir(nameFolder, { withFileTypes: true });

  FILES.forEach((elem) => {
    if (elem.isFile()) {
      INFO_FILES(elem.name, nameFolder);
    }
  });
};

INFO_FOLDER(SECRET_FOLDER);
