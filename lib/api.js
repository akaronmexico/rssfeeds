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
}

const partnerLoop = async (results) => {
let boards = [];
let index = 0;
  for (let partner of results) {
	  index++;
    let sql = 'SELECT * FROM partnerdata where partner = ?';
    try {
      let rows = await db.all(sql, [partner.partner]);
      let board = {};
	  board.name = partner.partner;
	  board.id = uuidv1();
	  board.cards = [];
      for (let article of rows) {
		  console.log("article: " + JSON.stringify(article,null,2));
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
  /* fs.writeFile("./output/boards.json", JSON.stringify(boards,null,2), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
}); */
    return boards;
  } catch (err) {
    console.log(err);
  }
}

exports.getPartnerData = getPartnerData;
exports.getPartners = getPartners;
exports.getBoards = getBoards;
