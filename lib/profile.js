const db = require("./database.js");
const partnerTables = require("./fillPartner");
const elastic = require("./elastic.js");

const itemOrSummary = (arr, item) => {
  return arr.filter(a => {
    return item.title.includes(a) || item.summary.includes(a);
  });
};

const profileItem = async (item, io) => {
  const matches = [];
  let summaryHits = 0;
  let titleHits = 0;
  const summaryPercolate = await elastic.percolate(item.summary);

  if (summaryPercolate.hits.total > 0) {
    // uncomment to see what percolate hits from elastic look like...
    //console.log("*******\t" + item.title + "   matched " + summaryPercolate.hits.total + " max score: " + summaryPercolate.hits.max_score);
    //console.log(JSON.stringify(summaryPercolate.hits.hits,null,2));
    //  console.log("*************************************");
    if (summaryPercolate.hits.hits) {
      // Do we care about all or just the most relevant to the query? i.e. summaryPercolate.hits.hits[0]
      // We probably want to concatenate the hit reasons? sum the score, and in fill tables even if title summary link already exist
      // overwrite on high score? add new keyword to table
      //summaryPercolate.hits.hits.forEach( async hit => {
      let hit = summaryPercolate.hits.hits[0];
      summaryHits++;
      const score = hit._score;
      const bin = hit._id;
      let keyword = "";
      if (hit._source.query.match) {
        keyword = hit._source.query.match.summary;
      } else {
        keyword = hit._source.query.query_string.query;
      }
      const partner = bin.split("_")[0];
      const target = bin.split("_")[1];
      const binId = bin.split("_")[2];
      await partnerTables.fillTable(
        item,
        score,
        partner,
        target,
        keyword,
        new Date().toISOString(),
        binId
      );
      if (io) {
        //  console.log("found a hit");
        // io.emit("article",{article: item});
      }
      //})
    }
  }

  // run same percolate query against title

  const titlePercolate = await elastic.percolate(item.title);

  if (titlePercolate.hits.total > 0) {
    //console.log(JSON.stringify(titlePercolate.hits.hits,null,2));
    if (titlePercolate.hits.hits) {
      //titlePercolate.hits.hits.forEach( async hit => {
      hit = titlePercolate.hits.hits[0];
      titleHits++; // do we want to count each percolate that hit as a hit?  or just count as one if it matches multiple?
      const score = hit._score;
      const bin = hit._id;
      let keyword = "";
      if (hit._source.query.match) {
        keyword = hit._source.query.match.summary;
      } else {
        keyword = hit._source.query.query_string.query;
      }
      const partner = bin.split("_")[0];
      const target = bin.split("_")[1];
      const binId = bin.split("_")[2];
      await partnerTables.fillTable(
        item,
        score,
        partner,
        target,
        keyword,
        new Date().toISOString(),
        binId
      );
      if (io) {
        // console.log("found a hit");
        // io.emit("article",{article: item});
      }
      //})
    }
  }
  if (titleHits > 0 || summaryHits > 0) {
    // console.log("# summary hits:\t" + summaryHits + "\t# title hits:\t" + titleHits + "\t" + item.title);
  }
};

exports.profileItem = profileItem;
