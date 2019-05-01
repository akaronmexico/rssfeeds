const db = require('./database.js');
const { Sema } = require('async-sema');
const s = new Sema(
  1,
  {
    capacity: 500
  }
);

const partnerLoop = async (results) => {
    for (let partner of results) {
		partner = partner.partner;
		let sql = 'update partners set runtime=? where Partner = ?'
		let now = new Date().toISOString();
        try {
            await db.all(sql, [now, partner]);
            let rows = await db.all('select target from partners where partner = ? order by target,keywords', [partner]);
            for (let target of rows) {
                target = target.target;
				sql = 'select * from titles where title like ? or summary like ?'
				let params = ['%' + target + '%', '%' + target + '%'];
				await articleLoop(sql, params, partner, target, '', now);
				await keywords(partner, target, now);
            }
        } catch (err) {
            console.log(err);
        }
    }
}

const keywords = async (partner, target, now) => {
    try {
        let results = await db.all('select keywords from partners where target = ?',[target]);
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
				await articleLoop(sql,params, partner, target, keyword, now);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const articleLoop = async (sql, params, partner, target, keyword, now) => {
    try {
        let results = await db.all(sql,params);
        for (let article of results) {
			await fillTable(article,0, partner, target, keyword, now)
		}
    } catch (err) {
        console.log(err);
    }
}

// added column for score so we can sort later and use this as a way to "rank" which articles to show at the top
const fillTable = async (article, score, partner, target, keyword, now) => {
    await s.acquire();
    try {
        let sql = 'select title,summary,link from partnerdata where partner=? and title=? and summary = ? and link=?';
        let results = await db.all(sql, [partner, article.title, article.summary, article.link]);
        if (results.length < 1) {
            let sql = 'insert into partnerdata (partner, target, keywords, title, summary, link, published, timestamp, runtime, src, feedname, currentflag, score) \
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
            let post  = [partner,target, keyword, article.title, article.summary, article.link,
                article.published, article.timestamp, now, article.src, article.feedname,1, score ];
            await db.all(sql, post);
            
            // broadcast insert to connected socket.io consumers here...
        }
    } catch (err) {
        console.log(err);
    } finally {
		s.release();
	}
}

const fillPartnerTables = async () => {
    let sql = 'select distinct partner from partners';
    try {
        let rows = await db.all(sql);
        await partnerLoop(rows);
    } catch (err) {
		console.log(err);
	}
}
// Whats actually most important here - Just target, target and key word (which actually never gets any hits), just keyword?
exports.fillPartnerTables = fillPartnerTables;
exports.fillTable = fillTable;
