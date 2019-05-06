const db = require('./database.js');
const fs = require('fs');
const uuidv1 = require('uuid/v1');

const getPartnerData = async function(partner, from, to) {
	try {
		let sql = ''
		let inserts = []
		if (partner) {
			sql = 'select * from partnerdata where partner=?';
			inserts = [partner]
		} else {
			sql = 'select * from partnerdata';
		}
		let rows = await db.all(sql, inserts);
		return rows;
	} catch (e) {
		console.log(e);
	}
}

const getPartners = async function(partner) {
  try {
    let sql = 'select distinct id, partner from partners';
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const createPartners = async function(body) {
  try {
    let sql = 'insert into partners (partner, timestamp) values (?,?)';
    let rows = await db.all(sql [body.name, new Date().toISOString()]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const createTargets = async function(body) {
  try {
    let sql = 'insert into targets (id, target) values (?,?)';
    let rows = await db.all(sql [body.id, body.name]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const createBins = async function(body) {
  try {
    let sql = 'insert into bins (bin) values (?,?)';
    let rows = await db.all(sql [body.name]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const createKeywords = async function(body) {
  try {
    let sql = 'insert into keywords (id, keyword) values (?,?)';
    let rows = await db.all(sql [body.id, body.name]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const updatePartners = async function(body) {
  try {
    let sql = 'update partners set partner=?, timestamp=? where id=?';
    let rows = await db.all(sql [body.name, new Date().toISOString(), body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const updateTargets = async function(body) {
  try {
    let sql = 'update targets set target=? where id=?';
    let rows = await db.all(sql [body.name, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const updateBins = async function(body) {
  try {
    let sql = 'update bins set bin=? where id=?';
    let rows = await db.all(sql [body.name, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const updateKeywords = async function(body) {
  try {
    let sql = 'update keywords set keyword=? where id=?';
    let rows = await db.all(sql [body.name, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const getTargets = async function(partnerId) {
  try {
    let sql = 'select distinct id, target from targets where id=?';
    let rows = await db.all(sql, [partnerId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const getBins = async function(partner) {
  try {
    let sql = 'select distinct id, bin from bins';
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const getKeywords = async function(binId) {
  try {
    let sql = 'select distinct id, keyword from keywords where id=?';
    let rows = await db.all(sql, [binId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

const partnerLoop = async (results) => {
let boards = [];
let index = 0;
  for (let partner of results) {
	  index++;
    let sql = 'SELECT * FROM partnerdata where partner = ? order by score desc';
    try {
      let rows = await db.all(sql, [partner.partner]);
      let board = {};
	  board.name = partner.partner;
	  board.id = uuidv1();
	  board.cards = [];
      for (let article of rows) {
		  board.cards.push({
			id: uuidv1(),
			title: article.title,
			summary: article.summary,
			target: article.target,
			keywords: article.keywords,
			link: article.link,
			feed: article.feedname,
			score: article.score,
			status: article.status,
			published: article.published
		  });
      }
      
	boards.push(board);
    } catch (err) {
      console.log(err);
    }
  }
  return boards;
}

const getBoards = async () => {
  let sql = 'select distinct partner from partners';
  try {
    let rows = await db.all(sql);
    const boards = await partnerLoop(rows);
    fs.writeFile("./output/boards.json", JSON.stringify(boards,null,2), 'utf8', function (err) {
      if (err) {
	console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
      console.log("JSON file has been saved.");
    }); 
    return boards;
  } catch (err) {
    console.log(err);
  }
}

exports.getPartnerData = getPartnerData;
exports.getPartners = getPartners;
exports.getBoards = getBoards;
