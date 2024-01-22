const PATH = require('path');
const FS = require('fs');
const FS_PROMISES = require('fs/promises');
const ASSETS_FOLDER = PATH.join(__dirname, 'assets');
const STYLES_FOLDER = PATH.join(__dirname, 'styles');
const DESTINATION_FOLDER = PATH.join(__dirname, 'project-dist');
let WRITE_STREAM;

const BUILD_HTML = async (templateSrc) => {
  let template = await FS_PROMISES.readFile(
    PATH.join(__dirname, templateSrc),
    'utf8',
  );
  const FILES = template.match(/(?<={{)[^}]*(?=}})/g);

  for (const elem of FILES) {
    const CHUNK = await FS_PROMISES.readFile(
      PATH.join(__dirname, 'components', `${elem}.html`),
      'utf8',
    );
    template = template.replace(`{{${elem}}}`, CHUNK);
  }
  FS_PROMISES.writeFile(PATH.join(DESTINATION_FOLDER, 'index.html'), template);
};

const CLEAR_FOLDER = async (nameFolder) => {
  await FS_PROMISES.rm(nameFolder, {
    recursive: true,
    force: true,
  });
  await FS_PROMISES.mkdir(nameFolder, { recursive: true });
};

const COPY_FOLDER = async (startFolder, destinationFolder) => {
  await CLEAR_FOLDER(destinationFolder);
  const FILES = await FS_PROMISES.readdir(startFolder, { withFileTypes: true });

  for (const elem of FILES) {
    if (elem.isFile()) {
      const OLD_FILE = PATH.join(startFolder, elem.name);
      const NEW_FILE = PATH.join(destinationFolder, elem.name);
      await FS_PROMISES.copyFile(OLD_FILE, NEW_FILE);
    } else if (elem.isDirectory()) {
      COPY_FOLDER(
        PATH.join(startFolder, elem.name),
        PATH.join(destinationFolder, elem.name),
      );
    }
  }
};

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

(async () => {
  await FS_PROMISES.mkdir(DESTINATION_FOLDER, { recursive: true });

  WRITE_STREAM = FS.createWriteStream(
    PATH.join(DESTINATION_FOLDER, 'style.css'),
    'utf-8',
  );

  await COPY_FOLDER(ASSETS_FOLDER, PATH.join(DESTINATION_FOLDER, 'assets'));
  await INFO_FOLDER(STYLES_FOLDER);
  await BUILD_HTML('template.html');
})();
