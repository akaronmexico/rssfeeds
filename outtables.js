const mysql      = require('mysql');
let pool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : 'ifu4jb2a',
  database : 'parser'
});

const partnerLoop = async (error, results, fields) => {
	if (error) throw error;
	for (let partner of results) {
		partner = partner.partner;
		//console.log(partner);
		let sql = 'update partners set runtime=? where Partner = ?'
		let now = new Date().toISOString();
		sql = mysql.format(sql, [now, partner]);
		var query = pool.query(sql, function (error, results, fields) {
			if (error) throw error;
    });
    sql = 'select target from partners where partner = ? order by target,keywords';
    sql = mysql.format(sql, [partner]);
    var query = pool.query(sql, function (error, results, fields) {
			if (error) throw error;
			for (let target of results) {
				target = target.target;
				sql = 'select * from articles where title like ? or summary like ?'
				sql = mysql.format(sql, ['%' + target + '%', '%' + target + '%']);
				// Just the taget
				articleLoop(sql, partner, target, '', now);
				keywords(partner, target, now);
			}
    });
	}
}

const keywords = async (partner, target, now) => {
	sql = 'select keywords from partners where target = ?';
	sql = mysql.format(sql, [target]);
	var query = pool.query(sql, function (error, results, fields) {
		if (error) throw error;
		for (let keyword of results) {
			keyword = keyword.keywords;
			if (keyword.length > 0/* || keyword !== ' ' || keyword !== null*/) {
				//console.log(keyword)
				/** orig q
						select * from titles where \
                       (title like ? and title like ?) or \
                       (summary like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? and summary like ?) */
				sql = 'select * from titles where \
                       (title like ? and title like ?) or \
                       (summary like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? or summary like ?)';
        sql = mysql.format(sql, ['%' + target + '%', '%' + keyword + '%',
                                 '%' + target + '%', '%' + keyword + '%',
                                 '%' + keyword + '%', '%' + keyword + '%',
                                 /**'%' + target + '%', '%' + target + '%',*/
                                 '%' + keyword + '%', '%' + target + '%',
                                 '%' + target + '%', '%' + keyword + '%',
                                 '%' + keyword + '%', '%' + keyword + '%']);
				// target and keyword
				articleLoop(sql, partner, target, keyword, now);
				// adding to select above
				/**sql = 'select * from titles where title like ? or summary like ?';
				sql = mysql.format(sql, ['%' + keyword + '%', '%' + keyword + '%'])
				articleLoop(sql, partner, target, keyword, now);*/
			} else {
				/** Orig query has summary like ? or title like ? which we have already done in just the target. 
				We probably don't need to do this at all*/
				//sql = 'select * from titles where (title like ? and summary like ?) or summary like ? or title like ?';
				/**sql = 'select * from titles where (title like ? and summary like ?)';
				sql = mysql.format(sql, ['%' + target + '%', '%' + target + '%', '%' + target + '%', '%' + target + '%']);
				
				articleLoop(sql, partner, target, keyword, now);*/
			}
			
		}
	});
}

const articleLoop = async (sql, partner, target, keyword, now) => {
	//console.log(target);
	var query = pool.query(sql, function (error, results, fields) {
		if (error) throw error;
		for (let article of results) {
			fillTable(article, partner, target, keyword, now)
		}
		console.log("done.");
	});
}

const fillTable = async (article, partner, target, keyword, now) => {
	//console.log(JSON.stringify(article));
	//console.log(partner + " " + target + " " + keyword);
	let sql = 'select title,summary,link from ' + partner + ' where title=? and summary = ? and link=?'
	sql = mysql.format(sql, [article.title, article.summary, article.link])
	let query = pool.query(sql, (error, results, fields) => {
    if (results.length < 1) {
			//console.log('insert this for ' + partner);
			//console.log(JSON.stringify(article));
			//insert into " + partner + " (target,keywords,title,summary,link,published,timestamp,runtime,src,feedname,currentflag)
			let sql = 'insert into ' + partner + ' SET ?';
			let post  = {target: target, keywords: keyword, title: article.title, summary: article.summary, link: article.link,
						 published: article.published, timestamp: article.timestamp, runtime: now, src: article.src, feedname: article.feedname,
						 currentflag: 'y'};
			var query = pool.query(sql, post, function (error, results, fields) {
        if (error) throw error;
          //console.log('inserted');
      });
    } else {
			//console.log('exists');
		}
	});
}

const fillPartnerTables = async () => {
  let sql = 'select distinct partner from partners';
  let query = pool.query(sql, partnerLoop);
}

exports.fillPartnerTables = fillPartnerTables;
