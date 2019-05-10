const db = require('./database.js');
const fs = require('fs');
const uuidv1 = require('uuid/v1');

exports.getPartnerData = async (partner, from, to) => {
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

exports.getPartners = async (partner) => {
  try {
    let sql = 'select distinct id, partner from partners';
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.createPartners = async (body) => {
  try {
    let sql = 'insert into partners (partner, timestamp) values (?,?)';
    let rows = await db.all(sql [body.name, new Date().toISOString()]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.createTargets = async (body) => {
  try {
    let sql = 'insert into targets (partnerId, target) values (?,?)';
    let rows = await db.all(sql [body.partnerId, body.name]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.createBins = async (body) => {
  try {
    let sql = 'insert into bins (bin, description) values (?,?)';
    let rows = await db.all(sql [body.name, body.description]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.createKeywords = async (body) => {
  try {
    let sql = 'insert into keywords (binId, targetId, keyword) values (?,?,?)';
    let rows = await db.all(sql [body.binId, body.targetId, body.name]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.createFeeds = async (body) => {
  try {
    let sql = 'insert into sources (src, rssname, url, timestamp) values (?,?,?,?)';
    let rows = await db.all(sql [body.src, body.rssname, body.url, new Date().toISOString()]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.updatePartners = async (body) => {
  try {
    let sql = 'update partners set partner=?, timestamp=? where id=?';
    let rows = await db.all(sql [body.name, new Date().toISOString(), body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.updateTargets = async (body) => {
  try {
    let sql = 'update targets set target=? where id=?';
    let rows = await db.all(sql [body.name, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.updateBins = async (body) => {
  try {
    let sql = 'update bins set bin=?, description=? where id=?';
    let rows = await db.all(sql [body.name, body.description, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.updateKeywords = async (body) => {
  try {
    let sql = 'update keywords set keyword=? where id=?';
    let rows = await db.all(sql [body.name, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.updateFeeds = async (body) => {
  try {
    let sql = 'update sources set src=?, rssname=?, url=?, timestamp=? where id=?';
    let rows = await db.all(sql [body.src, body.rssname, body.url, new Date().toISOString(), body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.deletePartners = async (partnerId) => {
 try {
    let sql = 'delete from partners where id=?';
    let rows = await db.all(sql, [partnerId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.deleteTargets = async (targetId) => {
  try {
    let sql = 'delete from targets where id=?';
    let rows = await db.all(sql, [targetId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.deleteBins = async (binId) => {
  try {
    let sql = 'delete from bins where id=?';
    let rows = await db.all(sql, [binId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.deleteKeywords = async (keywordId) => {
  try {
    let sql = 'delete from keywords where id=?';
    let rows = await db.all(sql, [keywordId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.deleteFeeds = async (feedId) => {
  try {
    let sql = 'delete from sources where id=?';
    let rows = await db.all(sql, [feedId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.getTargets = async (partnerId) => {
  try {
    let sql = 'select * from targets where partnerId=?';
    let rows = await db.all(sql, [partnerId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.getBins = async (partner) => {
  try {
    let sql = 'select * from bins';
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.getKeywords = async (binId) => {
  try {
    let sql = 'select * from keywords where binId=?';
    let rows = await db.all(sql, [binId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.getFeeds = async () => {
  try {
    let sql = 'select * from sources';
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
}

exports.getAllPartnersBoard = async () => {
  let sql = 'SELECT * FROM partnerdata where partner = ? order by score desc';
    try {
      let rows = await db.all(sql, [partner.partner]);
      let board = {};
	  board.name = partner.partner;
	  board.id = uuidv1();
	  board.cards = [];
	  let lists = {};
	  
      for (let article of rows) {
	let artId = uuidv1();
	let artStatus = article.status;
	if(!lists[artStatus]) {
	lists[artStatus] = {
	  name: artStatus,
	  id: uuidv1(),
	  idCards: []
	};
      }
      lists[artStatus].idCards.push(artId);
		  board.cards.push({
			id: artId,
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
      board.lists = Array.from(Object.values);
      
	boards.push(board);
    } catch (err) {
      console.log(err);
    }
}

const getPartnerBoard = async (results) => {
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
	  let lists = {};
	  
      for (let article of rows) {
	let artId = uuidv1();
	let artStatus = article.status;
	if(!lists[artStatus]) {
	lists[artStatus] = {
	  name: artStatus,
	  id: uuidv1(),
	  idCards: []
	};
      }
      lists[artStatus].idCards.push(artId);
		  board.cards.push({
			id: artId,
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
      board.lists = Array.from(Object.values);
      
	boards.push(board);
    } catch (err) {
      console.log(err);
    }
  }
  return boards;
}

exports.getBoards = async () => {
  let sql = 'select distinct partner from partners';
  try {
    let rows = await db.all(sql);
    const boards = await getPartnerBoard(rows);
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

/*exports.getPartnerData = getPartnerData;
exports.getPartners = getPartners;
exports.getBoards = getBoards;*/
