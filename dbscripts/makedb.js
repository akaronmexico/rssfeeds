const sqlite3 = require("sqlite3").verbose();

try {
  const db = new sqlite3.Database("db.sqlite", "OPEN_CREATE");

  db.on("open", function(evt) {
    console.log("DB Open", evt);
  });
  db.on("trace", function(evt) {
    console.log("DB Trace", evt);
  });
  db.on("profile", function(evt) {
    console.log("DB Profile", evt);
  });
  db.on("error", function(evt) {
    console.log("DB Error", evt);
  });

  db.serialize(function() {
    db.run(
      "DROP TABLE sources"
    );
    db.run(
      "DROP TABLE titles"
    );
    db.run(
      "DROP TABLE partners"
    );
    db.run(
      "DROP TABLE targets"
    );
    db.run(
      "DROP TABLE bins"
    );
    db.run(
      "DROP TABLE keywords"
    );
     db.run(
      "DROP TABLE partnerdata"
    );
    db.run(
      "CREATE TABLE sources (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT, rssname TEXT, url TEXT, timestamp TEXT, currentflag INTEGER)"
    );
    db.run(
      "CREATE TABLE titles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, summary TEXT, link TEXT, published TEXT, timestamp TEXT, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER)"
    );
    db.run(
    
      "CREATE TABLE partners (id INTEGER PRIMARY KEY AUTOINCREMENT, partner TEXT, nativeName TEXT, avatar TEXT, lat REAL, long REAL, capital TEXT, region TEXT, subregion TEXT, target TEXT, keywords TEXT, timestamp TEXT, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER)"
    );
    db.run(
      "CREATE TABLE targets (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT, partnerId INTEGER, CONSTRAINT fk_partners FOREIGN KEY (partnerId) REFERENCES partners(id) ON DELETE CASCADE)"
    );
    db.run(
      "CREATE TABLE bins (id INTEGER PRIMARY KEY AUTOINCREMENT, bin TEXT, description TEXT, color TEXT)"
    );
    db.run(
      "CREATE TABLE keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, targetId INTEGER, keyword TEXT, binId INTEGER, CONSTRAINT fk_bins FOREIGN KEY (binId) REFERENCES bins(id) ON DELETE CASCADE, CONSTRAINT fk_targets FOREIGN KEY (targetId) REFERENCES targets(id) ON DELETE CASCADE)"
    );
    db.run(
      "CREATE TABLE partnerdata (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT, keywords TEXT, partner TEXT, title TEXT, summary TEXT, link TEXT, published TEXT, timestamp TEXT, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER, score NUMERIC, content TEXT, status TEXT, binId INTEGER)"
    );
  });

  db.close();
} catch (e) {
  console.log("Unhandled Error", e);
}
