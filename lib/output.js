const fs = require('fs');
const db = require('./database.js');

const outputLoop = async (results) => {
  for (let partner of results) {
    partner = partner.partner;
    let writeStream = fs.createWriteStream('output/' + partner + '.csv');
    let sql = 'SELECT * FROM partnerdata where partner = ?';
    try {
      let rows = await db.all(sql, [partner]);
      let output = 'Target country | Keyword(s) | Title | Summary | Link | Published | Compiled | Source | feedname';
      writeStream.write(output, 'utf8');
      writeStream.write('\n', 'utf8');
      for (let article of rows) {
          // Target country | Keyword(s) | Title | Summary | Link | Published | Compiled | Source | feedname
	output = article.target + ' | ' + article.keywords + ' | ' + article.title + ' | ' + article.summary + ' | ' +  article.link
	  + ' | ' + article.published + ' | ' + article.runtime + ' | ' + article.src + ' | ' + article.feedname;
	writeStream.write(output, 'utf8');
        writeStream.write('\n', 'utf8');
      }
      writeStream.on('finish', () => {
	console.log('wrote all data to file');
      });
      writeStream.end();
    } catch (err) {
      console.log(er);
    }
  }
}

const createOutput = async () => {
  let sql = 'select distinct partner from partners';
  try {
    let rows = await db.all(sql);
    await outputLoop(rows);
  } catch (err) {
    console.log(er);
  }
}

exports.createOutput = createOutput;
