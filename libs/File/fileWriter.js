const fs      = require('fs');
const path    = require('path');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

function write2html(dir, filePrefix, data) {
  return fs
    .readdirAsync(dir)
    .then((files) => {
      const date       = new Date();
      const dateString = date.toDateString().replace(/\s/g, '_');
      const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '_');

      filePrefix       = filePrefix ? filePrefix.concat('_') : '';
      const filename   = `${dir}/${filePrefix}${dateString}_${timeString}.html`;

      console.log(`Number of files in the given directory: ${files.length}`);
      console.log(`Filename: ${filename}`);
      return fs.writeFileAsync(filename, data);
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        console.log(err.Error);
        console.log(`Now creates the required directory: ${dir}`);
        return fs
          .mkdirAsync(dir)
          .then(() => {
            write2html(dir, filePrefix, data);
          });
      }
      throw new Error(err);
    });
}

function write2csv(headers, data, filepath) {
  const writeStream = fs.createWriteStream(filepath);

  if (headers.length > 0) {
    writeStream.write(`${headers.join(',')}\n`);
  }

  for (let i = 0; i <= data.length; i++) {
    if (i === data.length) {
      writeStream.end();
    } else {
      writeStream.write(`${data[i].join(',')}\n`);
    }
  }

  writeStream.on('finish', () => {
    console.log('Data has been successfully written.');
    writeStream.close();
  });

  writeStream.on('error', (err) => {
    if (err.code === 'ENOENT') {
      const dir = path.dirname(filepath);
      console.log(err.Error);
      console.log(`Now creates the required directory: ${dir}`);
      return fs
        .mkdirAsync(dir)
        .then(() => {
          write2csv(headers, data, filepath);
        });
    }
    throw new Error(err);
  });
  return 0;
}

exports.write2csv  = write2csv;
exports.write2html = write2html;
