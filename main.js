const express = require('express');
const app = express();
const port = 3000;
const partnerTables = require('./outtables');
const createOutput = require('./output');
const striptags = require('striptags');
const RssFeedEmitter = require('rss-feed-emitter');
const mysql      = require('mysql');
let feeder = new RssFeedEmitter();
let pool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : 'ifu4jb2a',
  database : 'parser'
});

const addFeeds = () => {
    let query = pool.query('SELECT * FROM sources');
    query
        .on('error', function (err) {
            console.log(err);
        })
        .on('result', function (row) {
            feeder.add({
                url: row.url
            });
        })
        .on('end', function () {
            // anything?
            console.log("feeds added: ");
            let feedList = feeder.list();
            for (let feed of feedList) {
                console.log(feed.url);
            }
        });
}

addFeeds();

feeder.on('new-item', function(item) {
    //console.log(JSON.stringify(item))
    console.log("article found: " + item.title);
    let sql = 'select * from articles where title = ?';
	let inserts = [item.title];
    sql = mysql.format(sql, inserts);
    let query = pool.query(sql, (error, results, fields) => {
        if (results.length < 1) {
            let pubdate = null;
            let now = new Date().toISOString();
            if (item.pubdate && item.pubdate != '') {
                pubdate = item.pubdate;
            } else if (item.pubDate && item.pubDate != '') {
                pubdate = item.pubDate;
            } else if (item.date && item.date != '') {
                pubdate = item.date;
            }
            // "insert into titles (title,summary,link,published,timestamp,runtime,src,feedname,currentflag)"            
            var post  = {title: striptags(item.title.replace(/\r?\n|\r/g, " ").trim()), summary: striptags(item.summary.replace(/\r?\n|\r/g, " ").trim()),
                         link: item.link, published: item.pubdate, timestamp: now, runtime: now, src: '', feedname: item.meta.title, currentflag: 'y'};
            var query = pool.query('INSERT INTO articles SET ?', post, function (error, results, fields) {
                if (error) throw error;
            });
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
    let query = pool.query('SELECT * FROM articles');
    query
        .on('error', function (err) {
            console.log(err);
        })
        .on('result', function (row) {
            result.push(JSON.stringify(row));
        })
        .on('end', function () {
            selectCount(result,res);
        });
};

const selectCount = (result, res) => {
    let query = pool.query('SELECT count(*) FROM articles');
    query
        .on('error', function (err) {
            console.log(err);
        })
        .on('result', function (row) {
            result.push(JSON.stringify(row));
        })
        .on('end', function () {
            res.send(result);
        });
};
