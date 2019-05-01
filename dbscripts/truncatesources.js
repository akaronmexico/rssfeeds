const sqlite3 = require('sqlite3').verbose();

try{


const db = new sqlite3.Database('db.sqlite','OPEN_CREATE');
	
db.on('open',function(evt){console.log("DB Open",evt)});
db.on('trace',function(evt){console.log("DB Trace",evt)});
db.on('profile',function(evt){console.log("DB Profile",evt)});
db.on('error',function(evt){console.log("DB Error",evt)});

db.serialize(function() {
  db.run("DELETE from titles");
  db.run("DELETE from sources");
});

db.close();

}
catch(e){console.log("Unhandled Error",e)}
