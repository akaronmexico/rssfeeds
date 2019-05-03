const fs = require('fs');
const db = require('./database.js');
const memberJSON = require('./data/members.json');
const labelsJSON = require('./data/labels.json');


const buildLabels = () => {
		
}

const outputLoop = async (results) => {
let boards = [];
  for (let partner of results) {
    let sql = 'SELECT * FROM partnerdata where partner = ?';
    try {
      let rows = await db.all(sql, [partner]);
	  board.name = partner;
	  board.cards = [];
      for (let article of rows) {
		  board.cards.push({
			id: article.id,
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
      console.log(er);
    }
  }
  return boards;
}

const createOutput = async () => {
  let sql = 'select distinct partner from partners';
  try {
    let rows = await db.all(sql);
    const partnerJSON = await outputLoop(rows);
    let json = 
  } catch (err) {
    console.log(er);
  }
}

exports.createOutput = createOutput;

