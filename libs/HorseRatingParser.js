const fs         = require('fs');
const Promise    = require('bluebird');
const cheerio    = require('cheerio');
const path       = require('path');
const fileWriter = require('./File/fileWriter');
const Horse      = require('../models/Horse');

Promise.promisifyAll(fs);

// require('mongoose')
//   .connect('mongodb://localhost:27017/hkjc-horse-racing')
//   .then(() => {
//     console.log('Successfully connect to the specified mongo instance.');
//   })
//   .catch((err) => {
//     console.error(err);
//     process.exit();
//   });

function buildHorseEntryUrl(id) {
  return [
    `http://www.hkjc.com/chinese/racing/horse.asp?HorseNo=${id}&Option=1`,
    `http://www.hkjc.com/english/racing/horse.asp?HorseNo=${id}&Option=1`
  ];
}

class HorseRatingPageParser {
  constructor(opts) {
    if (typeof opts !== 'object') {
      opts = {};
    }
    this.filepath = opts.filepath || `${path.dirname(__dirname)}/download/HorseList_Sun_Apr_16_2017_01_14_29.html`;
    this.pattern  = opts.pattern || 'tr[style="font-family:細明體_HKSCS"] ~ tr:nth-child(n+2)';
    this.csvpath  = opts.csvpath || `${path.dirname(__dirname)}/download/list.csv`;
  }

  async parse() {
    const records = [];

    try {
      const file = await fs.readFileAsync(this.filepath);
      const $    = cheerio.load(file);

      $(this.pattern).each((i, elem) => {
        const numColumns = $(elem).children('td').length;

        if (numColumns > 0) {
          let row = [];

          for (let index = 0; index < numColumns; index++) {
            const line = $(elem).children('td').eq(index).text();
            row.push(line);

            if (index === 5 || index === 11) {
              row = row.concat(buildHorseEntryUrl(row[2]));

              if (row[1].trim() !== '') {
                row = row
                  .filter((value, pos) => pos !== 5)
                  .map((value, pos) => {
                    if (pos === 4 && value.trim() === '') {
                      return 0;
                    }
                    return value;
                  });
                const horse = new Horse({
                  _id: row[2],
                  url: row.slice(5, row.length),
                  names: row.slice(0, 2),
                  rating: {
                    current: row[3],
                    change: row[4]
                  }
                });
                horse
                  .save((err) => {
                    console.error(err);
                  });
                records.push(row);
              }
              row = [];
            }
          }
        }
      });

      fileWriter.write2csv([], records, this.csvpath);
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
    return records;
  }
}

module.exports = HorseRatingPageParser;

(async function main() {
  const response = new HorseRatingPageParser();
  await response.parse();
  return 0;
}());
