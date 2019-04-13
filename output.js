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
		let sql = 'select * from ' + parner;
		var query = pool.query(sql, function (error, results, fields) {
			if (error) throw error;
			let output = '';
			output = 'Target country	Keyword(s)	Title	Summary	Link	Published	Compiled	Source	feedname'
			for (let article of results) {
				//Target country	Keyword(s)	Title	Summary	Link	Published	Compiled	Source	feedname

			}
		});
	}
};

let sql = 'select distinct partner from partners';

let query = pool.query(sql, outputLoop);
