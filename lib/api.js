const db = require("./database.js");
const feeds = require("./feeds");
const percolate = require("./elastic-percolate");
const fs = require("fs");
const uuidv4 = require("uuid/v4");
const request = require("request");
const elastic = require("./elastic.js");

const getStatusInt = function(status) {
  if (!status) {
    return -1;
  }
  status = status.toLowerCase();
  if (status === "new") {
    return 1;
  } else if (status === "in work") {
    return 2;
  } else if (status === "amplified") {
    return 3;
  } else if (status === "published") {
    return 4;
  } else {
    return 5;
  }
};
/*
exports.getPartnerData = async (partner, from, to) => {
  try {
    let sql = "";
    let inserts = [];
    if (partner) {
      sql = "select * from partnerdata where partner=?";
      inserts = [partner];
    } else {
      sql = "select * from partnerdata";
    }
    let rows = await db.all(sql, inserts);
    return rows;
  } catch (e) {
    console.log(e);
  }
};*/

exports.getArticleHistogram = async () => {
  let histogram = elastic.getHistogram(null, null);
};

exports.getPartners = async partner => {
  try {
    let sql = "select distinct id, partner from partners";
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

getCountryDetails = async name => {
  let url = "http://restcountries.eu/rest/v2/name/" + name.toLowerCase();

  return new Promise(function(resolve, reject) {
    request(url, function(err, res, body) {
      let results = JSON.parse(body)[0];

      resolve({
        capital: results.capital,
        nativeName: results.nativeName,
        avatar: results.flag,
        region: results.region,
        subregion: results.subregion
      });
    });
  });
};

exports.getPartnerConfig = async () => {
  let sql =
    "select distinct id, partner, capital, region, subregion, avatar, nativeName from partners";
  let partners = await db.all(sql);
  let p = [];
  if (partners) {
    for (let i = 0; i < partners.length; i++) {
      const partner = partners[i];
      partner.name = partner.partner;

      partner.targets = [];
      sql = "select distinct id, target from targets where partnerId=?";
      let targets = await db.all(sql, [partner.id]);
      const newTargets = [];
      if (targets) {
        for (let j = 0; j < targets.length; j++) {
          const target = targets[j];
          target.name = target.target;
          target.bins = [];
          const bins = {};
          sql =
            "select k.id as keywordId, k.keyword as keywordName, b.id as binId, b.bin as binName, b.description as binDescription from keywords k, bins b, targets t where k.binId = b.id and k.targetId = t.id and t.id=?";
          let keywords = await db.all(sql, [target.id]);
          if (keywords) {
            for (let k = 0; k < keywords.length; k++) {
              const keyword = keywords[k];
              const binId = keyword.binId;
              if (!bins[binId]) {
                bins[binId] = {
                  id: keyword.binId,
                  bin: {
                    id: binId,
                    name: keyword.binName,
                    description: keyword.binDescription
                  },
                  keywords: []
                };
              }
              bins[binId].keywords.push(keyword.keywordName);
            }
          }

          target.bins = Array.from(Object.values(bins));
          newTargets.push(target);
        }
        partner.targets = newTargets;
        p.push(partner);
      }
    }
  }

  return p;
};

exports.removePartner = async partnerName => {
  let sql = "delete from partners where partner = ?";
  let results = await db.run(sql, [partnerName]);
  return results;
};

exports.createPartnerConfig = async body => {
  // need to check if it already exists before inserting

  // need to add percolate queries to elastic after insert
  console.log("creating partner config...");
  const targets = body.targets;
  const removeIfExists = await this.removePartner(body.name);
  console.log(
    "removeIfExists for:  " +
      body.name +
      ":\t" +
      JSON.stringify(removeIfExists, null, 2)
  );
  const details = await getCountryDetails(body.name);
  let sql =
    "insert into partners (partner, nativeName, capital, region, subregion, avatar, timestamp) values (?,?,?,?,?,?,?)";
  let results = await db.run(sql, [
    body.name,
    details.nativeName,
    details.capital,
    details.region,
    details.subregion,
    details.avatar,
    new Date().toISOString()
  ]);
  if (targets && results && results.lastID) {
    const partnerId = results.lastID;
    for (let i = 0; i < targets.length; i++) {
      sql = "insert into targets (target, partnerId) values (?,?)";
      const target = targets[i];
      const bins = target.bins;
      let targetResults = await db.run(sql, [target.name, partnerId]);
      if (bins && targetResults && targetResults.lastID) {
        const targetId = targetResults.lastID;
        for (let j = 0; j < bins.length; j++) {
          const bin = bins[j];
          const binId = bin.bin.id;
          const keywords = bin.keywords;
          if (keywords) {
            for (let k = 0; k < keywords.length; k++) {
              const keyword = keywords[k];
              if (keyword) {
                sql =
                  "insert into keywords (binId, targetId, keyword) values (?,?,?)";
                const kReturn = await db.run(sql, [binId, targetId, keyword]);
              }
            }
          }
        }
      }
    }
  }
  const pr = await percolate.resetPercolate();
  const feedReturn = await feeds.refreshFeeds();
  return { success: pr };
};

exports.createPartners = async body => {
  try {
    let sql = "insert into partners (partner, timestamp) values (?,?)";
    let rows = await db.run(sql, [body.name, new Date().toISOString()]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.createTargets = async body => {
  try {
    let sql = "insert into targets (partnerId, target) values (?,?)";
    let rows = await db.run(sql, [body.partnerId, body.name]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.createBins = async body => {
  try {
    let sql = "insert into bins (bin, description) values (?,?)";
    if (!body.description) {
      body.description = "";
    }
    let rows = await db.run(sql, [body.name, body.description]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.createKeywords = async body => {
  try {
    let sql = "insert into keywords (binId, targetId, keyword) values (?,?,?)";
    let rows = await db.all(sql[(body.binId, body.targetId, body.name)]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.createFeeds = async body => {
  try {
    if (body.id) {
      let deleteSql = "delete from sources where id=?";
      let del = await db.run(deleteSql, [body.id]);
    }
    let sql =
      "insert into sources (src, rssname, url, timestamp) values (?,?,?,?)";
    let rows = await db.run(sql, [
      body.src,
      body.rssname,
      body.url,
      new Date().toISOString()
    ]);
    feeds.refreshFeeds();
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.updatePartners = async body => {
  try {
    let sql = "update partners set partner=?, timestamp=? where id=?";
    let rows = await db.run(sql, [
      body.name,
      new Date().toISOString(),
      body.id
    ]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.updateTargets = async body => {
  try {
    let sql = "update targets set target=? where id=?";
    let rows = await db.run(sql, [body.name, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.updateBins = async body => {
  try {
    let sql = "update bins set bin=?, description=? where id=?";
    let rows = await db.run(sql, [body.name, body.description, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.updateKeywords = async body => {
  try {
    let sql = "update keywords set keyword=? where id=?";
    let rows = await db.run(sql, [body.name, body.id]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.updateFeeds = async body => {
  try {
    let sql =
      "update sources set src=?, rssname=?, url=?, timestamp=? where id=?";
    let rows = await db.run(
      sql[(body.src, body.rssname, body.url, new Date().toISOString(), body.id)]
    );
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.deletePartners = async partnerId => {
  try {
    let sql = "delete from partners where id=?";
    let rows = await db.all(sql, [partnerId]);
    let perc = percolate.resetPercolate();
    return perc;
  } catch (err) {
    console.log(err);
  }
};

exports.deleteTargets = async targetId => {
  try {
    let sql = "delete from targets where id=?";
    let rows = await db.all(sql, [targetId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.deleteBins = async binId => {
  try {
    let sql = "delete from bins where id=?";
    let rows = await db.all(sql, [binId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.deleteKeywords = async keywordId => {
  try {
    let sql = "delete from keywords where id=?";
    let rows = await db.all(sql, [keywordId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.deleteFeeds = async feedId => {
  try {
    let sql = "delete from sources where id=?";
    let rows = await db.all(sql, [feedId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.getTargets = async partnerId => {
  try {
    let sql = "select * from targets where partnerId=?";
    let rows = await db.all(sql, [partnerId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.getBins = async () => {
  try {
    let sql = "select * from bins";
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.getKeywords = async binId => {
  try {
    let sql = "select * from keywords where binId=?";
    let rows = await db.all(sql, [binId]);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.getFeeds = async () => {
  try {
    let sql = "select * from sources";
    let rows = await db.all(sql);
    return rows;
  } catch (err) {
    console.log(err);
  }
};

exports.getPartnerBoards = async () => {
  const boards = [];
  let sql = "select distinct partner from partners";
  try {
    let rows = await db.all(sql);
    for (let partner of rows) {
      boards.push({
        name: partner.partner,
        id: uuidv4(),
        uri: partner.partner,
        settings: {
          color: "fuse-dark",
          subscribed: false,
          cardCoverImages: false
        }
      });
    }
    boards.push({
      name: "Aggregated Partner View",
      id: uuidv4(),
      uri: "all",
      settings: {
        color: "fuse-dark",
        subscribed: false,
        cardCoverImages: false
      }
    });
  } catch (err) {
    console.log(err);
  }
  boards.sort((a, b) => a.name.localeCompare(b.name));
  return boards;
};

exports.getPartnerDetails = async partnerName => {
  let sql = "select * from partners where partner = ? LIMIT 1";
  let rows = await db.all(sql, [partnerName]);
  console.log("number of partners: " + rows.length);
  return rows;
};

exports.getAllByPartner = async () => {
  let board = {};
  board.id = uuidv4();
  board.cards = [];
  board.settings = {
    color: "fuse-dark",
    subscribed: false,
    cardCoverImages: false
  };
  board.bins = await this.getBins();
  let lists = {};
  const sql =
    "SELECT partnerdata.*, partners.region, partners.subregion FROM partnerdata JOIN partners ON partners.partner = partnerData.partner order by score desc";

  try {
    let rows = await db.all(sql);

    for (let article of rows) {
      let artId = uuidv4();
      let partnerName = article.partner;
      if (!lists[partnerName]) {
        lists[partnerName] = {
          name: partnerName,
          id: uuidv4(),
          idCards: []
        };
      }
      lists[partnerName].idCards.push(artId);
      board.cards.push({
        id: artId,
        title: article.title,
        summary: article.summary,
        target: article.target,
        keywords: article.keywords,
        idLabels: [],
        attachments: [],
        idAttachmentCover: "",
        subscribed: false,
        checklists: [],
        checkItems: 0,
        checkItemsChecked: 0,
        comments: [],
        idMembers: [],
        link: article.link,
        feed: article.feedname,
        score: article.score,
        partner: partnerName,
        status: article.status,
        statusInt: getStatusInt(article.status),
        timestamp: article.timestamp,
        idBins: [article.binId],
        region: article.region,
        subregion: article.subregion
      });
    }
    board.lists = Array.from(Object.values(lists));
    board.lists.sort(function(a, b) {
      return a.sortValue - b.sortValue;
    });
  } catch (err) {
    console.log(err);
  }
  return board;
};

exports.getAllBySubregion = async () => {
  let board = {};
  board.id = uuidv4();
  board.cards = [];
  board.settings = {
    color: "fuse-dark",
    subscribed: false,
    cardCoverImages: false
  };
  board.bins = await this.getBins();
  let lists = {};
  const sql =
    "SELECT partnerdata.*, partners.region, partners.subregion FROM partnerdata JOIN partners ON partners.partner = partnerData.partner order by score desc";

  try {
    let rows = await db.all(sql);

    for (let article of rows) {
      let artId = uuidv4();
      let artSubregion = article.subregion;
      let partnerName = article.partner;
      if (!lists[artSubregion]) {
        lists[artSubregion] = {
          name: artSubregion,
          id: uuidv4(),
          idCards: []
        };
      }
      lists[artSubregion].idCards.push(artId);
      board.cards.push({
        id: artId,
        title: article.title,
        summary: article.summary,
        target: article.target,
        keywords: article.keywords,
        idLabels: [],
        attachments: [],
        idAttachmentCover: "",
        subscribed: false,
        checklists: [],
        checkItems: 0,
        checkItemsChecked: 0,
        comments: [],
        idMembers: [],
        link: article.link,
        feed: article.feedname,
        score: article.score,
        partner: partnerName,
        status: article.status,
        statusInt: getStatusInt(article.status),
        timestamp: article.timestamp,
        idBins: [article.binId],
        region: article.region,
        subregion: article.subregion
      });
    }
    board.lists = Array.from(Object.values(lists));
    board.lists.sort(function(a, b) {
      return a.sortValue - b.sortValue;
    });
  } catch (err) {
    console.log(err);
  }
  return board;
};

exports.getPartnerData = async partner => {
  let board = {};
  board.name = partner;
  board.id = uuidv4();
  board.cards = [];
  board.settings = {
    color: "fuse-dark",
    subscribed: false,
    cardCoverImages: false
  };
  board.bins = await this.getBins();
  let lists = {};
  let rows = null;
  let sql = "";
  if (partner && partner === "all") {
    partner = null;
  }
  if (partner && partner !== "") {
    sql = "SELECT * FROM partnerdata where partner = ? order by score desc";
  } else {
    sql = "SELECT * FROM partnerdata order by score desc";
  }

  try {
    if (partner && partner !== "") {
      rows = await db.all(sql, [partner]);
    } else {
      rows = await db.all(sql);
    }

    for (let article of rows) {
      let artId = uuidv4();
      let artStatus = article.status;
      let partnerName = article.partner;
      //let partnerDetails = await getPartnerDetails(partnerName);
      if (!lists[artStatus]) {
        lists[artStatus] = {
          name: artStatus,
          sortValue: getStatusInt(artStatus),
          id: uuidv4(),
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
        idLabels: [],
        attachments: [],
        idAttachmentCover: "",
        subscribed: false,
        checklists: [],
        checkItems: 0,
        checkItemsChecked: 0,
        comments: [],
        idMembers: [],
        link: article.link,
        feed: article.feedname,
        score: article.score,
        partner: partnerName,
        status: article.status,
        statusInt: getStatusInt(article.status),
        timestamp: article.timestamp,
        idBins: [article.binId]
      });
    }
    board.lists = Array.from(Object.values(lists));
    board.lists.sort(function(a, b) {
      return a.sortValue - b.sortValue;
    });
  } catch (err) {
    console.log(err);
  }
  return board;
};

exports.getBoards = async () => {
  let sql = "select distinct partner from partners";
  try {
    let rows = await db.all(sql);
    const boards = await getPartnerBoard(rows);
    fs.writeFile(
      "./output/boards.json",
      JSON.stringify(boards, null, 2),
      "utf8",
      function(err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
        console.log("JSON file has been saved.");
      }
    );
    return boards;
  } catch (err) {
    console.log(err);
  }
};
