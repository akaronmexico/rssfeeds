const mysql      = require('mysql');
let pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'ifu4jb2a',
  database : 'parser'
});
	
const partners = async (pool) => {
	let sql = 'select distinct partner from partners';
	let inserts = [];
	sql = mysql.format(sql,inserts);
	pool.query(sql)
		.on('result', function(row, index) {
			console.log(JSON.stringify(row));
			// just the target
			justTarget(row.partner, pool);
		})
		.on('end', function() {
			// all rows have been received
			//connection.end();
		});
}

const justTarget = async (partner, pool) => {
	let sql = 'select target from partners where partner = ? order by target,keywords' ;
	let inserts = [partner];
	sql = mysql.format(sql, inserts);
	pool.query(sql)
		.on('result', function(row, index) {
			console.log(JSON.stringify(row));
			// target and each key word
			targetKeyword(row.target, pool)
		})
		.on('end', function() {
			// all rows have been received
			//connection.end();
		});
};

const targetKeyword = async (target, pool) => {
	let sql = 'select keywords from partners where target = ?' ;
	let inserts = [target];
	sql = mysql.format(sql, inserts);
	pool.query(sql)
		.on('result', function(row, index) {
			console.log(JSON.stringify(row));
			// target and each key word
			//targetKeyword(row.target)
		})
		.on('end', function() {
			// all rows have been received
			//connection.end();
		});
};

partners(pool);
