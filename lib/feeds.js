const db = require("./database.js");
const striptags = require("striptags");
const profile = require("./profile");
const RssFeedEmitter = require("rss-feed-emitter");
const { Sema } = require("async-sema");
const s = new Sema(1, { capacity: 500 });
let feeder = new RssFeedEmitter();

const setupFeeder = async () => {
  if (!feeder) {
    return;
  }
  feeder.on("new-item", async item => {
    //console.log(JSON.stringify(item, null, 2));
    await s.acquire();
    item.title = item.title
      ? striptags(item.title.replace(/\r?\n|\r/g, " ").trim())
      : "";

    // we might want to always profile each item just in case the score/popularity/keywords changed since the last time it was returned...

    let sql = "select * from titles where title = ?";
    let inserts = [item.title];
    try {
      let pubdate = null;
      let now = new Date().toISOString();
      if (item.pubdate && item.pubdate != "") {
        pubdate = item.pubdate;
      } else if (item.pubDate && item.pubDate != "") {
        pubdate = item.pubDate;
      } else if (item.date && item.date != "") {
        pubdate = item.date;
      }
      item.published = pubdate;
      item.feedname = item.meta.title;
      item.src = "";
      item.summary = item.summary
        ? striptags(item.summary.replace(/\r?\n|\r/g, " ").trim())
        : "";
      item.timestamp = now;

      let rows = await db.all(sql, inserts);
      if (rows.length < 1) {
        var post = [
          item.title,
          item.summary,
          item.link,
          item.published,
          now,
          now,
          item.src,
          item.feedname,
          1
        ];

        await db.all(
          "INSERT INTO titles (title, summary, link, published, timestamp, runtime, src, feedname, currentflag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          post
        );
        await profile.profileItem(item);
      } else {
        //console.log("article already added: " + item.title);
        await profile.profileItem(item);
      }
    } catch (err) {
      console.log(err);
    } finally {
      s.release();
    }
  });
};

const addFeeds = async () => {
  try {
    let rows = await db.all("SELECT * FROM sources");
    for (let row of rows) {
      feeder.add({
        url: row.url
      });
    }
    //console.log("feeds added: ");
    let feedList = feeder.list();
    console.log("subscribing to " + feedList.length + " feeds");
    setupFeeder();
  } catch (err) {
    console.log(err);
  }
};

const refreshFeeds = async () => {
  if (feeder) {
    console.log("feeder will be reset...");
    feeder.destroy();
  }
  feeder = new RssFeedEmitter();
  let f = await this.addFeeds();
  return f;
};

exports.addFeeds = addFeeds;
exports.refreshFeeds = refreshFeeds;
