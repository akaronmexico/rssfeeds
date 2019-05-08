var sqlite3 = require('sqlite3').verbose();

try{

var db = new sqlite3.Database('db.sqlite','OPEN_CREATE');
	
db.on('open',function(evt){console.log("DB Open",evt)});
db.on('trace',function(evt){console.log("DB Trace",evt)});
db.on('profile',function(evt){console.log("DB Profile",evt)});
db.on('error',function(evt){console.log("DB Error",evt)});

/*
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Nigeria','Syria','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Turkey','Putin','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Libya','Russia','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Congo','Russia','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Iraq','Russia','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Nigeria','Russia','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Russia','Putin','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Turkey','Russia','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Iraq','Russia','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Turkey','France','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Nigeria','Putin','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Russia','beat','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Congo','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Congo','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Congo','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Libya','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Libya','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Libya','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Libya','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Belarus','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Turkey','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Turkey','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Netherlands','Turkey','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Congo','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Congo','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Congo','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Congo','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Georgia','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Iraq','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Nigeria','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Russia','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Turkey','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Turkey','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Turkey','','20190306133300','1')", function(err){});
db.run("insert into partners (partner,target,keywords,timestamp,currentflag) values ('Romania','Turkey','','20190306133300','1')", function(err){});
*/
db.run("insert into partners (partner,timestamp,currentflag) values ('Georgia', '20190306133300','1')", function(err){
	if (err) {
      console.log(err.message);
    }
    let lastId = this.lastID;
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Iraq'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Nigeria'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Russia'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Libya'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Congo'], function(err){});
});

db.run("insert into partners (partner,timestamp,currentflag) values ('Netherlands', '20190306133300','1')", function(err){
	if (err) {
      console.log(err.message);
    }
    let lastId = this.lastID;
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Belarus'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Congo'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Iraq'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Libya'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Nigeria'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Turkey'], function(err){});
});

db.run("insert into partners (partner,timestamp,currentflag) values ('Romania', '20190306133300','1')", function(err){
	if (err) {
      console.log(err.message);
    }
    let lastId = this.lastID;
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Iraq'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Nigeria'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Russia'], function(err){});
    db.run("insert into targets (partnerId, target) values (?,?)", [lastId, 'Turkey'], function(err){});
});

db.run("insert into bins (bin) values ('Aggressor')", function(err){
	if (err) {
      console.log(err.message);
    }
    let lastId = this.lastID;
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 1, 'conflict'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 2, 'beat'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 3, 'Putin'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 4, 'fight'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 5, 'missle'], function(err){});
});

db.run("insert into bins (bin) values ('Rogue')", function(err){
	if (err) {
      console.log(err.message);
    }
    let lastId = this.lastID;
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 6, 'election'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 7, 'fraud'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 8, 'waste'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 9, 'misuse'], function(err){});
    db.run("insert into keywords (binId, targetId, keyword) values (?,?,?)", [lastId, 10, 'abuse'], function(err){});
});

/** * */
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'worldNews', 'http://feeds.reuters.com/Reuters/worldNews', '20190305013000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'somalia', 'http://feeds.reuters.com/reuters/AFRICAsomaliaNews', '20190305092600', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'Libya', 'http://feeds.reuters.com/reuters/AFRICAlibyaNews', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'Money', 'http://feeds.reuters.com/news/wealth', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'Business', 'http://feeds.reuters.com/reuters/businessNews', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'India_South_Asia', 'http://feeds.reuters.com/reuters/INsouthAsiaNews', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('NPR', 'News', 'http://www.npr.org/rss/rss.php?id=1001', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('BBC', 'International News', 'http://feeds.bbci.co.uk/news/world/rss.xml', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('BBC', 'Africa', 'http://feeds.bbci.co.uk/news/world/africa/rss.xml', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('BBC', 'Europe', 'http://feeds.bbci.co.uk/news/world/europe/rss.xml', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('BBC', 'Middle East', 'http://feeds.bbci.co.uk/news/world/middle_east/rss.xml', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('AlJazeera', 'World', 'https://www.aljazeera.com/xml/rss/all.xml', '20190305160000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('lemonde', 'lemond.fr', 'http://www.lemonde.fr/rss/une.xml', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('wired', 'wired', 'http://feeds.wired.com/wired/index', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'Environment', 'http://feeds.reuters.com/reuters/environment', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('Reuters', 'CAR', 'http://feeds.reuters.com/reuters/AFRICAcentralAfricanRepublicNews', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('CNN', 'World', 'http://rss.cnn.com/rss/cnn_world.rss', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('CNN', 'Business', 'http://rss.cnn.com/rss/money_latest.rss', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('BBC', 'Business', 'http://feeds.bbci.co.uk/news/business/rss.xml', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('HackerNews', 'HackerNews', 'https://news.ycombinator.com/rss', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('feedburner', 'scandanavia', 'http://feeds.feedburner.com/satwcomic', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('NYT', 'Africa', 'https://www.nytimes.com/services/xml/rss/nyt/Africa.xml', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('NYT', 'Americas', 'https://www.nytimes.com/services/xml/rss/nyt/Americas.xml', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('NYT', 'AsiaPacific', 'https://www.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('NYT', 'Europe', 'https://www.nytimes.com/services/xml/rss/nyt/Europe.xml', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('NYT', 'MiddleEast', 'https://www.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('NYT', 'Business', 'http://feeds.nytimes.com/nyt/rss/Business', '20190306130000', '1')", function(err){});
db.run("insert into sources (src,rssname,url,timestamp,currentflag) values ('BBC', 'Portuguese', 'http://feeds.bbci.co.uk/portuguese/rss.xml', '20190306130000', '1')", function(err){});


db.close();

}
catch(e){console.log("Unhandled Error",e)};
