const fs      = require('fs');
const Request = require('request');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const fileWriter = require('./libs/File/fileWriter');

Promise.promisifyAll(fs);
Promise.promisifyAll(Request);

function getHorseList() {
  const url       = 'http://www.hkjc.com/chinese/racing/mcs01_xml_horserating.asp?type=CLAS';
  const startTime = new Date();

  return Request
    .getAsync(url)
    .then((response) => {
      console.log(`Start Time: ${startTime.toUTCString()}`);
      console.log(`Status Code: ${response.statusCode}`);
      console.log(`Status Message: ${response.statusMessage}`);
      console.log(`Server: ${response.headers.server || ''}`);
      console.log(`X-Powered-By: ${response.headers['x-powered-by']}`);
      console.log(`Date: ${response.headers.date || ''}`);
      console.log(`MIME: ${response.headers['content-type'] || ''}`);
      console.log(`HTML File Size: ${Buffer.byteLength(response.body) || 0}b`);
      console.log(`Duration: ${(new Date().getTime() - startTime) / 1000}s`);
      return response.body;
    });
}

// getHorseList()
//   .then((response) => {
//     console.log(`Filesize: ${Math.round(Buffer.byteLength(response) / 1024)}kb`);

//     write2file('./download', 'HorseList', response)
//       .then(() => console.log('Horse list has been saved successfully.'));
//   })
//   .catch(err => console.error(err));

function getHorseInfoURL(id) {
  return [
    `http://www.hkjc.com/chinese/racing/horse.asp?HorseNo=${id}&Option=1`,
    `http://www.hkjc.com/english/racing/horse.asp?HorseNo=${id}&Option=1`
  ];
}

async function  (htmlFile) {
  const records = [];

  try {
    const file = await fs.readFileAsync(htmlFile);
    const $    = cheerio.load(file);

    $('tr[style="font-family:細明體_HKSCS"] ~ tr:nth-child(n+2)').each((i, elem) => {
      const numColumns = $(elem).children('td').length;

      if (numColumns > 0) {
        let row = [];

        for (let index = 0; index < numColumns; index++) {
          const line = $(elem).children('td').eq(index).text();
          row.push(line);

          if (index === 5 || index === 11) {
            row = row.concat(getHorseInfoURL(row[2]));

            if (row[1].trim() !== '') {
              records
                .push(row
                  .filter((value, pos) => pos !== 5)
                  .map((value, pos) => {
                    if (pos === 4 && value.trim() === '') {
                      return 0;
                    }
                    return value;
                  })
                );
            }
            row = [];
          }
        }
      }
    });

    fileWriter.write2csv([], records,  `${__dirname}/download/list.csv`);
  } catch (err) {
    console.error(err);
  }
  return records;
}

(async function main() {
  const response = await horseListParser(`${__dirname}/download/HorseList_Sun_Apr_16_2017_01_14_29.html`);
  console.dir(response);
}());
