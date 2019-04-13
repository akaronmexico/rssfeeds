const fs = require('fs');
const mysql      = require('mysql');
let pool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : 'ifu4jb2a',
  database : 'parser'
});

const outputLoop = async (error, results, fields) => {
	if (error) throw error;
	for (let partner of results) {
		partner = partner.partner;
		let writeStream = fs.createWriteStream('output/' + partner + '.csv');
		let sql = 'select * from ' + partner;
		var query = pool.query(sql, function (error, results, fields) {
			if (error) throw error;
			let output = 'Target country | Keyword(s) | Title | Summary | Link | Published | Compiled | Source | feedname'
			writeStream.write(output, 'utf8');
			writeStream.write('\n', 'utf8');
			for (let article of results) {
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
		});
	}
};

let sql = 'select distinct partner from partners';

let query = pool.query(sql, outputLoop);
