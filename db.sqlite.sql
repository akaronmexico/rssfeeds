BEGIN TRANSACTION;
CREATE TABLE "titles" (
	`uuid`	TEXT NOT NULL UNIQUE,
	`title`	TEXT,
	`summary`	TEXT,
	`link`	TEXT,
	`published`	TEXT,
	`timestamp`	TEXT,
	`runtime`	TEXT,
	`src`	TEXT,
	`feedname`	TEXT,
	`currentflag`	INTEGER,
	PRIMARY KEY(`uuid`)
);
CREATE TABLE targets (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT, partnerId INTEGER, CONSTRAINT fk_partners FOREIGN KEY (partnerId) REFERENCES partners(id) ON DELETE CASCADE);
CREATE TABLE sources (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT, rssname TEXT, url TEXT, timestamp TEXT, currentflag INTEGER);
CREATE TABLE partners (id INTEGER PRIMARY KEY AUTOINCREMENT, partner TEXT, nativeName TEXT, avatar TEXT, lat REAL, long REAL, capital TEXT, region TEXT, subregion TEXT, target TEXT, keywords TEXT, timestamp TEXT, runtime TEXT, src TEXT, feedname TEXT, currentflag INTEGER);
CREATE TABLE "partnerdata" (
	`uuid`	TEXT NOT NULL UNIQUE,
	`target`	TEXT,
	`keywords`	TEXT,
	`partner`	TEXT,
	`title`	TEXT,
	`summary`	TEXT,
	`link`	TEXT,
	`published`	TEXT,
	`timestamp`	TEXT,
	`runtime`	TEXT,
	`src`	TEXT,
	`feedname`	TEXT,
	`currentflag`	INTEGER,
	`score`	NUMERIC,
	`content`	TEXT,
	`status`	TEXT,
	`binId`	INTEGER,
	`imageUrl`	TEXT,
	PRIMARY KEY(`uuid`)
);
CREATE TABLE keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, targetId INTEGER, keyword TEXT, binId INTEGER, CONSTRAINT fk_bins FOREIGN KEY (binId) REFERENCES bins(id) ON DELETE CASCADE, CONSTRAINT fk_targets FOREIGN KEY (targetId) REFERENCES targets(id) ON DELETE CASCADE);
CREATE TABLE bins (id INTEGER PRIMARY KEY AUTOINCREMENT, bin TEXT, description TEXT, color TEXT);
CREATE INDEX `uuid` ON `titles` (`uuid` ASC)





;
CREATE INDEX `partnerdata_uuid` ON `partnerdata` (`uuid` ASC)


;
COMMIT;
