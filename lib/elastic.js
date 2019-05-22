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
  return await client.index({
    index: "partnerdata",
    id: article.uuid,
    type: "_partnerdata",
    body: article
  });
};

const articleDateHistogram = async (dateRangeStr, duration) => {
  const histogram = await client.search({
    index: "partnerdata",
    type: "_partnerdata",
    body: {
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
  console.log("histogram: " + JSON.stringify(histogram, null, 2));
};

exports.percolate = percolate;
exports.insertArticle = insertArticle;
