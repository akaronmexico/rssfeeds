const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite','OPEN_READWRITE');

const outputLoop = async (error, results) => {
	if (error) throw error;
	for (let partner of results) {
		partner = partner.partner;
		let writeStream = fs.createWriteStream('output/' + partner + '.csv');
		let sql = 'select * from ' + partner;
    let query = db.all('SELECT * FROM partnerdata where partner = ?', [partner], function(err,rows){
      if (err) console.log(err);
      else {
        let output = 'Target country | Keyword(s) | Title | Summary | Link | Published | Compiled | Source | feedname'
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
      }
    });
	}
};

const createOutput = async () => {
  let sql = 'select distinct partner from partners';
  let query = db.all(sql, outputLoop);
}

exports.createOutput = createOutput;
