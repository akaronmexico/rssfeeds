const elastic = require("./elastic.js");
const db = require("./database.js");

const {
  Client
} = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
  log: "error"
});

const buildProfiles = async () => {
  let profiles = [];
  try {
    let sql = "select id, partner from partners";
    let results = await db.all(sql);
    for (let partner of results) {
      let targets = [];
      sql = "select * from targets where partnerId=?";
      let targetResults = await db.all(sql, [partner.id]);
      for (let target of targetResults) {
        sql = "select * from keywords where targetId=?";
        let keywordResults = await db.all(sql, [target.id]);
        target.keywords = keywordResults;
        targets.push(target);
      }
      profiles.push({
        partner: partner.partner,
        targets: targets
      });
    }
    return profiles;
  } catch (err) {
    console.log(err);
  }
};

const dropIndex = async function (indexName) {
  console.log("deleting index: " + indexName);
  return await client.indices
    .delete({
      index: indexName
    })
    .catch(err => {
      console.log("caught error dropping index: " + err);
      return null;
    });
};

const addMapping = async function (indexName, mapping) {
  return await client.indices
    .putMapping({
      index: indexName,
      body: mapping
    })
    .catch(err => {
      console.error("caught mapping error: " + err);
    });
};

const addCheckedDataMapping = async function (indexName, mapping) {
  return await client.indices
    .putMapping({
      index: indexName,
      type: "checkedarticle",
      include_type_name: true,
      body: mapping
    })
    .catch(err => {
      console.error("caught checked mapping error: " + err);
      return false;
    });
};

const addPartnerDataMapping = async function (indexName, mapping) {
  return await client.indices
    .putMapping({
      index: indexName,
      type: "partnerarticle",
      include_type_name: true,
      body: mapping
    })
    .catch(err => {
      console.error("caught mapping error: " + err);
    });
};

const createIndex = async function (indexName) {
  console.log("creating index: " + indexName);
  return await client.indices.create({
    index: indexName,
    include_type_name: true
  });
};

const insertDoc = async function (indexName, _id, mappingType, data) {
  //console.log("creating document:  " + JSON.stringify(data, null, 2));
  return await client.index({
    index: indexName,
    id: _id,
    type: mappingType,
    body: data
  });
};

const addPercolatorQueries = async function (indexName, mappingName) {
  const profiles = await buildProfiles();
  const inserts = [];
  profiles.forEach(item => {
    let partner = item.partner;
    let targets = item.targets;
    let targetCounter = 1;
    targets.forEach(target => {
      let keywords = target.keywords;
      let targetCountry = target.target;
      /*inserts.push(insertDoc(indexName, partner + '_' + targetCountry, mappingName, {
                "query": {
                    "match": {
                        "summary": targetCountry
                    }
                }
            }));*/
      let keywordCounter = 1;

      keywords.forEach(keyword => {
        let json = {
          query: {
            match: {
              summary: keyword.keyword
            }
          }
        };
        inserts.push(
          insertDoc(
            indexName,
            partner +
            "_" +
            target.target +
            "_" +
            keyword.binId +
            "_" +
            keywordCounter,
            mappingName,
            json
          )
        );
        // Target and Keyword
        json = {
          query: {
            query_string: {
              default_field: "summary",
              query: "(" + targetCountry + ") AND (" + keyword.keyword + ")"
            }
          }
        };
        inserts.push(
          insertDoc(
            indexName,
            partner +
            "_" +
            target.target +
            "_" +
            keyword.binId +
            "_TANDK" +
            "_" +
            keywordCounter,
            mappingName,
            json
          )
        );
        keywordCounter++;
      });
      targetCounter++;
    });
  });
  return await Promise.all(inserts);
};

const resetChecked = async () => {
  const mapping2 = {
    properties: {
      uuid: {
        type: "keyword"
      },
      timestamp: {
        type: "date"
      },
      title: {
        type: "text"
      },
      summary: {
        type: "text"
      },
      rssUrl: {
        type: "keyword"
      },
      feedname: {
        type: "keyword"
      },
      type: {
        type: "keyword"
      }
    }
  };


  const dropResponse2 = await dropIndex("checked");
  const createIndexResponse2 = await createIndex("checked");
  const createMappingResponse2 = await addCheckedDataMapping(
    "checked",
    mapping2
  );
}

const resetTitles = async () => {
  const mapping = {
    properties: {
      uuid: {
        type: "keyword"
      },
      timestamp: {
        type: "date"
      },
      title: {
        type: "text"
      },
      summary: {
        type: "text"
      },
      partner: {
        type: "keyword"
      },
      keywords: {
        type: "keyword"
      },
      target: {
        type: "keyword"
      },
      rssUrl: {
        type: "keyword"
      },
      feedname: {
        type: "keyword"
      },
      region: {
        type: "keyword"
      },
      subregion: {
        type: "keyword"
      },
      bin: {
        type: "keyword"
      },
      score: {
        type: "keyword"
      }
    }
  };



  const dropResponse = await dropIndex("partnerdata");
  const createIndexResponse = await createIndex("partnerdata");
  const createMappingResponse = await addPartnerDataMapping(
    "partnerdata",
    mapping
  );

};

const rebuildMetrics = async () => {
  await db.open("db.sqlite");
  const sql =
    "SELECT partnerdata.*, partners.region, partners.subregion, bins.bin FROM partnerdata JOIN partners ON partners.partner = partnerData.partner JOIN bins ON bins.id = partnerdata.binId order by score desc";

  let rows = await db.all(sql);
  let bulk = [];
  for (let article of rows) {
    let doc = {
      uuid: article.uuid,
      title: article.title,
      summary: article.summary,
      partner: article.partner,
      rssUrl: article.src,
      date: new Date(article.timestamp),
      score: article.score,
      keywords: article.keywords,
      target: article.target,
      bin: article.bin,
      subregion: article.subregion,
      region: article.region,
      type: "partnerarticle"
    };

    bulk.push({
      index: {
        _index: "partnerdata",
        _type: "partnerarticle",
        _id: article.uuid
      }
    });
    bulk.push(doc);
  }
  console.log("indexing " + rows.length + " articles");
  const bulkRet = await client.bulk({
    body: bulk
  });
  let errorCount = 0;
  // console.log(JSON.stringify(bulkRet,null,2));

  return bulkRet;

};

const rebuildChecked = async () => {
  await db.open("db.sqlite");
  const sql =
    "SELECT * from titles";
  let rows = await db.all(sql);
  let bulk = [];
  for (let article of rows) {
    let doc = {
      uuid: article.uuid,
      title: article.title,
      summary: article.summary,
      rssUrl: article.src,
      date: new Date(article.timestamp),
      type: "checked"
    };

    bulk.push({
      index: {
        _index: "checked",
        _type: "checkedarticle",
        _id: doc.uuid
      }
    });
    bulk.push(doc);
  }
  console.log("indexing " + rows.length + " from titles");
  const bulkRet = await client.bulk({
    body: bulk
  });
  let errorCount = 0;
  // console.log(JSON.stringify(bulkRet,null,2));

  return bulkRet;

};

const resetPercolate = async () => {
  await db.open("db.sqlite");

  const mapping = {
    properties: {
      summary: {
        type: "text"
      },
      query: {
        type: "percolator"
      }
    }
  };

  const dropResponse = await dropIndex("articles");
  const createIndexResponse = await createIndex("articles");
  const createMappingResponse = await addMapping("articles", mapping);
  const percolatorIndexResponse = await addPercolatorQueries(
    "articles"
  );
  return true;
};

exports.resetPercolate = resetPercolate;
exports.resetTitles = resetTitles;
//resetChecked();
// rebuildChecked();