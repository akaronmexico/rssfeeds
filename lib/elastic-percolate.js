const elastic = require("./elastic.js");
const db = require("./database.js");

const { Client } = require("@elastic/elasticsearch");
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
      profiles.push({ partner: partner.partner, targets: targets });
    }
    console.log("profiles: " + JSON.stringify(profiles, null, 2));
    return profiles;
  } catch (err) {
    console.log(err);
  }
};

const dropIndex = async function(indexName) {
  return await client.indices
    .delete({
      index: indexName
    })
    .catch(err => {
      console.log("caught error dropping index: " + err);
      return null;
    });
};

const addMapping = async function(indexName, mapping) {
  return await client.indices
    .putMapping({
      index: indexName,
      type: "_doc",
      body: mapping
    })
    .catch(err => {
      console.error("caught mapping error: " + err);
    });
};

const addPartnerDataMapping = async function(indexName, mapping) {
  return await client.indices
    .putMapping({
      index: indexName,
      type: "partnerarticle",
      body: mapping
    })
    .catch(err => {
      console.error("caught mapping error: " + err);
    });
};

const createIndex = async function(indexName) {
  console.log("creating index: " + indexName);
  return await client.indices.create({
    index: indexName
  });
};

const insertDoc = async function(indexName, _id, mappingType, data) {
  return await client.index({
    index: indexName,
    id: _id,
    type: mappingType,
    body: data
  });
};

const addPercolatorQueries = async function(indexName, mappingName) {
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
      source: {
        type: "keyword"
      },
      score: {
        type: "scaled_float",
        scaling_factor: 100
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
    "articles",
    "_doc"
  );
  return true;
};

exports.resetPercolate = resetPercolate;
exports.resetTitles = resetTitles;


