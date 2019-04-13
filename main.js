const express = require('express');
const app = express();
const port = 3000;
const partnerTables = require('./lib/fillPartner');
const createOutput = require('./lib/output');
const profile = require('./lib/profile');
const striptags = require('striptags');
const RssFeedEmitter = require('rss-feed-emitter');
let feeder = new RssFeedEmitter();
const db = require('./lib/database.js');

const addFeeds = async () => {
    try {
        let rows = await db.all('SELECT * FROM sources');
        for (let row of rows){
            feeder.add({
                url: row.url
            });
        };
        console.log("feeds added: ");
        let feedList = feeder.list();
        for (let feed of feedList) {
            console.log(feed.url);
        }
    } catch (err) {
        console.log(err);
    }
}

feeder.on('new-item', async (item) => {
    //console.log("article found: " + item.title);
    item.title = striptags(item.title.replace(/\r?\n|\r/g, " ").trim());
    let sql = 'select * from titles where title = ?';
	let inserts = [item.title];
    try {
        let rows = await db.all(sql, inserts);
        if (rows.length < 1) {
            let pubdate = null;
            let now = new Date().toISOString();
            if (item.pubdate && item.pubdate != '') {
                pubdate = item.pubdate;
            } else if (item.pubDate && item.pubDate != '') {
                pubdate = item.pubDate;
            } else if (item.date && item.date != '') {
                pubdate = item.date;
            }
            item.published = pubdate;
            item.feedname = item.meta.title;
            item.src = '';
            item.summary = striptags(item.summary.replace(/\r?\n|\r/g, " ").trim());
            item.timestamp = now;
            var post  = [item.title, item.summary, item.link, item.published, now, now, item.src, item.feedname, 1];
                         
            await db.all('INSERT INTO titles (title, summary, link, published, timestamp, runtime, src, feedname, currentflag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', post);
            await profile.profileItem(item);
        } else {
            //console.log("article already added: " + item.title);
        }
    } catch (err) {
        console.log(err);
    }
})

app.get('/fill', async (req, res) => 
    {
        await partnerTables.fillPartnerTables();
        res.send("Done.");
    }
);

app.get('/output', async (req, res) => 
    {
        await createOutput.createOutput();
        res.send("Done.");
    }
);

app.listen(port, async () => {
    await db.open('db.sqlite');
    await profile.resetProfile();
    await addFeeds();
    console.log(`Example app listening on port ${port}!`);
});
