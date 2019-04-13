const express = require('express');
const app = express();
const port = 3000;
const partnerTables = require('./outtables');
const createOutput = require('./output');
const striptags = require('striptags');
const RssFeedEmitter = require('rss-feed-emitter');
let feeder = new RssFeedEmitter();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite','OPEN_READWRITE');

const addFeeds = () => {
    let query = db.all('SELECT * FROM sources',function(err,rows){
        if (err) console.log(err);
        else {
            for (let row of rows){
                feeder.add({
                    url: row.url
                });
            }
            console.log("feeds added: ");
            let feedList = feeder.list();
            for (let feed of feedList) {
                console.log(feed.url);
            }
        }
    });
}

addFeeds();

feeder.on('new-item', function(item) {
    //console.log(JSON.stringify(item))
    console.log("article found: " + item.title);
    let sql = 'select * from titles where title = ?';
	let inserts = [item.title];
    db.all(sql, inserts, function(err,rows){
        if (err) console.log(err);
        
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
            var post  = [striptags(item.title.replace(/\r?\n|\r/g, " ").trim()), striptags(item.summary.replace(/\r?\n|\r/g, " ").trim()),
                         item.link, item.pubdate, new Date().toISOString(), new Date().toISOString(), '', item.meta.title];
                         
            db.all('INSERT INTO titles (title, summary, link, published, timestamp, runtime, src, feedname, currentflag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', post);
        } else {
            console.log("article already added: " + item.title);
        }
    });
})

console.log("feeds added: ");
            let feedList = feeder.list();
            for (var i = 0; i < feedList.length; i++) {
                //console.log(feedList[i].url);
            }

app.get('/fill', async (req, res) => 
    {
        await partnerTables.fillPartnerTables();
        var result = selectOne(res);
    }
);

app.get('/output', async (req, res) => 
    {
        await createOutput.createOutput();
        var result = selectOne(res);
    }
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const selectOne = (res) => {
    let result = [];
    db.all('SELECT * FROM titles',function(err,rows){
        if (err) console.log(err);
        selectCount(JSON.stringify(rows),res);
    });
};

const selectCount = (result, res) => {
    db.all('SELECT count(*) FROM titles',function(err,rows){
        if (err) console.log(err);
        else{
            res.json({articles:result,count:rows});
        }
    });
};
