var sqlite3 = require('sqlite3').verbose();

try{

var db = new sqlite3.Database('db.sqlite','OPEN_CREATE');
	
db.on('open',function(evt){console.log("DB Open",evt)});
db.on('trace',function(evt){console.log("DB Trace",evt)});
db.on('profile',function(evt){console.log("DB Profile",evt)});
db.on('error',function(evt){console.log("DB Error",evt)});

db.serialize(function() {
  db.run("CREATE TABLE sources (id INTEGER PRIMARY KEY AUTOINCREMENT , src TEXT, rssname TEXT, url TEXT, timestamp INTEGER, currentflag INTEGER)");
  db.run("CREATE TABLE titles (id INTEGER PRIMARY KEY AUTOINCREMENT , title TEXT, summary TEXT, link TEXT, published INTEGER, timestamp INTEGER, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER)");
  db.run("CREATE TABLE partners (id INTEGER PRIMARY KEY AUTOINCREMENT , partner TEXT, target TEXT, keywords TEXT, timestamp INTEGER, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER)");
});

db.close();

}
catch(e){console.log("Unhandled Error",e)}
