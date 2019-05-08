const sqlite3 = require('sqlite3').verbose();

try{

const db = new sqlite3.Database('db.sqlite','OPEN_CREATE');
	
db.on('open',function(evt){console.log("DB Open",evt)});
db.on('trace',function(evt){console.log("DB Trace",evt)});
db.on('profile',function(evt){console.log("DB Profile",evt)});
db.on('error',function(evt){console.log("DB Error",evt)});

db.serialize(function() {
  db.run("CREATE TABLE sources (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT, rssname TEXT, url TEXT, timestamp TEXT, currentflag INTEGER)");
  db.run("CREATE TABLE titles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, summary TEXT, link TEXT, published TEXT, timestamp TEXT, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER)");
  db.run("CREATE TABLE partners (id INTEGER PRIMARY KEY AUTOINCREMENT, partner TEXT, target TEXT, keywords TEXT, timestamp TEXT, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER)");
  db.run("CREATE TABLE targets (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT, partnerId INTEGER, CONSTRAINT fk_partners FOREIGN KEY (partnerId) REFERENCES partners(id) ON DELETE CASCADE)");
  db.run("CREATE TABLE bins (id INTEGER PRIMARY KEY AUTOINCREMENT, bin TEXT, description TEXT)");
  db.run("CREATE TABLE keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, targetId INTEGER, keyword TEXT, binId INTEGER, CONSTRAINT fk_bins FOREIGN KEY (binId) REFERENCES bins(id) ON DELETE CASCADE, CONSTRAINT fk_targets FOREIGN KEY (targetId) REFERENCES bins(id) ON DELETE CASCADE)");
  db.run("CREATE TABLE partnerdata (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT, keywords TEXT, partner TEXT, title TEXT, summary TEXT, link TEXT, published TEXT, timestamp TEXT, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER, score NUMERIC, content TEXT, status TEXT, binId INTEGER)");
});

db.close();

}
catch(e){console.log("Unhandled Error",e)}
