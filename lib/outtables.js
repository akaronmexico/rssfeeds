const db = require('./database.js');

const partnerLoop = async (error, results) => {
	if (error) throw error;
	for (let partner of results) {
		partner = partner.partner;
		let sql = 'update partners set runtime=? where Partner = ?'
		let now = new Date().toISOString();
		db.all(sql, [now, partner],function (error, results){if (error) console.error(error);});
		db.all('select target from partners where partner = ? order by target,keywords', [partner],function (error, results){
			if (error) console.error(error);
			for (let target of results) {
				target = target.target;
				sql = 'select * from titles where title like ? or summary like ?'
				let params = ['%' + target + '%', '%' + target + '%'];
				articleLoop(sql, params, partner, target, '', now);
				keywords(partner, target, now);
			}
		});
	};
}

const keywords = async (partner, target, now) => {
	db.all('select keywords from partners where target = ?',[target], function (error, results) {
		if (error) console.error(error);
		for (let keyword of results) {
			keyword = keyword.keywords;
			if (keyword.length > 0) {
				const sql = 'select * from titles where \
                       (title like ? and title like ?) or \
                       (summary like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? and summary like ?) or \
                       (title like ? or summary like ?)';
                const params = ['%' + target + '%', '%' + keyword + '%',
                                 '%' + target + '%', '%' + keyword + '%',
                                 '%' + keyword + '%', '%' + keyword + '%',
                                 '%' + keyword + '%', '%' + target + '%',
                                 '%' + target + '%', '%' + keyword + '%',
                                 '%' + keyword + '%', '%' + keyword + '%'];
				// target and keyword
				articleLoop(sql,params, partner, target, keyword, now);
			} else {

			}
			
		}
	});
}

const articleLoop = async (sql, params, partner, target, keyword, now) => {
	db.all(sql,params, function (error, results) {
		if (error) console.error(error);
		for (let article of results) {
			fillTable(article, partner, target, keyword, now)
		}
		console.log("done.");
	});
}

const fillTable = async (article, partner, target, keyword, now) => {
	let sql = 'select title,summary,link from partnerdata where partner=? and title=? and summary = ? and link=?';
	db.all(sql, [partner, article.title, article.summary, article.link], (error, results) => {
        if (results.length < 1) {
                let sql = 'insert into partnerdata (partner, target, keywords, title, summary, link, published, timestamp, runtime, src, feedname, currentflag) \
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
                let post  = [partner,target, keyword, article.title, article.summary, article.link,
                             article.published, article.timestamp, now, article.src, article.feedname,1];
                db.all(sql, post, function (error, results) {
                    if (error) throw error;
                });
        } else { }
	});
}

const fillPartnerTables = async () => {
  let sql = 'select distinct partner from partners';
  db.all(sql, partnerLoop);
}

exports.fillPartnerTables = fillPartnerTables;
