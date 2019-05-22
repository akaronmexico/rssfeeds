const fs = require("fs");
const { Client } = require("elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
  log: "error"
});

const percolate = async function(summaryText) {
  const body = {
    query: {
      percolate: {
        field: "query",
        document: {
          summary: summaryText
        }
      }
    }
  };
  return await client.search({ index: "articles", body: body });
};

const insertArticle = async article => {
  let insert = await client.index({
    index: "partnerdata",
    id: article.uuid,
    type: "partnerarticle",
    body: article
  });
  return insert;
};

const getHistogram = async (dateRangeStr, duration) => {
  const histogram = await client.search({
    index: "partnerdata",
    type: "partnerarticle",
    body: {
      size: 0,
      aggs: {
        articles_over_time: {
          date_histogram: {
            field: "date",
            interval: "1h"
          }
        }
      }
    }
  });

  return histogram;
};

exports.percolate = percolate;
exports.insertArticle = insertArticle;
exports.getHistogram = getHistogram;
