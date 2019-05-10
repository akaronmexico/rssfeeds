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

exports.percolate = percolate;
