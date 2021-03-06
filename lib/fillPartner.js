const db = require("./database.js");
const {
  Sema
} = require("async-sema");
const elastic = require("./elastic.js");
const uuidv4 = require("uuid/v4");

const statuses = [
  "New",
  "In Work",
  "Amplified",
  "Published",
  "New",
  "New",
  "In Work",
  "New",
  "Published",
  "Amplified",
  "In Work",
  "New"
];

const s = new Sema(1, {
  capacity: 500
});

const partnerLoop = async results => {
  for (let partner of results) {
    partner = partner.partner;
    let sql = "update partners set runtime=? where Partner = ?";
    let now = new Date().toISOString();
    try {
      await db.all(sql, [now, partner]);
      let rows = await db.all(
        "select target from partners where partner = ? order by target,keywords",
        [partner]
      );
      for (let target of rows) {
        target = target.target;
        sql = "select * from titles where title like ? or summary like ?";
        let params = ["%" + target + "%", "%" + target + "%"];
        await articleLoop(sql, params, partner, target, "", now);
        await keywords(partner, target, now);
      }
    } catch (err) {
      console.log(err);
    }
  }
};

const keywords = async (partner, target, now) => {
  try {
    let results = await db.all(
      "select keywords from partners where target = ?",
      [target]
    );
    for (let keyword of results) {
      keyword = keyword.keywords;
      if (keyword.length > 0) {
        const sql =
          "select * from titles where \
                    (title like ? and title like ?) or \
                    (summary like ? and summary like ?) or \
                    (title like ? and summary like ?) or \
                    (title like ? and summary like ?) or \
                    (title like ? and summary like ?) or \
                    (title like ? or summary like ?)";
        const params = [
          "%" + target + "%",
          "%" + keyword + "%",
          "%" + target + "%",
          "%" + keyword + "%",
          "%" + keyword + "%",
          "%" + keyword + "%",
          "%" + keyword + "%",
          "%" + target + "%",
          "%" + target + "%",
          "%" + keyword + "%",
          "%" + keyword + "%",
          "%" + keyword + "%"
        ];
        // target and keyword
        await articleLoop(sql, params, partner, target, keyword, now);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const articleLoop = async (sql, params, partner, target, keyword, now) => {
  try {
    let results = await db.all(sql, params);
    for (let article of results) {
      await fillTable(article, 0, partner, target, keyword, now);
    }
  } catch (err) {
    console.log(err);
  }
};

// added column for score so we can sort later and use this as a way to "rank" which articles to show at the top
const fillTable = async (
  article,
  score,
  partner,
  target,
  keyword,
  now,
  binId
) => {
  await s.acquire();
  try {
    let sql =
      "select uuid, score,title,summary,link from partnerdata where partner=? and title=? and summary=? and keywords=? and link=?";
    let results = await db.all(sql, [
      partner,
      article.title,
      article.summary,
      keyword,
      article.link
    ]);
    // console.log("article enclosures: " + JSON.stringify(article.enclosures,null,2));
    let imageUrl = null;
    if (article.enclosures && article.enclosures.length > 0) {
      let enc = article.enclosures[0];
      imageUrl = enc.url;
    } else if (article['rss:image']) {
      imageUrl = article['rss:image'];
      console.log("found image!")
    }


    if (results.length < 1) {
      let uuid = uuidv4();
      let sql =
        "insert into partnerdata (uuid, partner, target, keywords, imageUrl, title, summary, link, published, timestamp, runtime, src, feedname, currentflag, score, status, binId) \
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      let post = [
        uuid,
        partner,
        target,
        keyword,
        imageUrl,
        article.title,
        article.summary,
        article.link,
        article.published,
        article.timestamp,
        now,
        article.meta.link,
        article.feedname,
        1,
        score,
        statuses[Math.floor(Math.random() * statuses.length)],
        binId
      ];
      await db.all(sql, post);
      let ei = await elastic.insertArticle({
        uuid: uuid,
        title: article.title,
        summary: article.summary,
        partner: partner,
        rssUrl: article.src,
        date: new Date(article.timestamp),
        score: score,
        keywords: keyword,
        target: target
      });
      // console.log("inserted article:\t" + article.title);


      console.log(
        partner +
        " article (" +
        keyword +
        "):\t" +
        JSON.stringify(article.title, null, 2)
      );

      // broadcast insert to connected socket.io consumers here...
    }
  } catch (err) {
    console.log(err);
  } finally {
    s.release();
  }
};

const fillPartnerTables = async () => {
  let sql = "select distinct partner from partners";
  try {
    let rows = await db.all(sql);
    await partnerLoop(rows);
  } catch (err) {
    console.log(err);
  }
};
// Whats actually most important here - Just target, target and key word (which actually never gets any hits), just keyword?
exports.fillPartnerTables = fillPartnerTables;
exports.fillTable = fillTable;