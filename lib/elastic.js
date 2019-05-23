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

const bulkIndex = async (bulk) => {
  return await client.bulk({body: bulk});
};

const getTermsAgg = async (fieldName,dateRangeStr) => {
  const searchObj = {index: "partnerdata",
    type: "partnerarticle",
    body: {
      size: 0,
      aggs: {
        top_terms: {
          terms: {
            field: ''
          }
        }
      }
    }
  };
  searchObj.body.aggs.top_terms.terms.field = fieldName;
  const termsAgg = await client.search(searchObj);
  const buckets = termsAgg.aggregations.top_terms.buckets;
  const metrics = [];
  for(let i = 0; i < buckets.length; i++) {
    const b = buckets[i];
    metrics.push({keyword: b.key, count: b.doc_count});
  }
  return metrics;
};

const getFieldedHistogram = async (fieldName, dateRangeStr, interval = '1d') => {
  const searchBody = {
    index: "partnerdata",
    type: "partnerarticle",
    body: {
      size: 0,
      query: {},
      aggs: {
        myAggs: {
          terms: {
            field: ''
          },
          aggs: {
            fieldHistogram: {
              date_histogram: {
                field: "date",
                interval: interval
              }
            }
              
          }
        }
      }
    }
  };
  if(dateRangeStr && dateRangeStr !== '') {
    searchBody.body.query['range'] = {
      date: {
        gte: "now-" + dateRangeStr,
        lt: "now/d"
      }
    }
  }
  searchBody.body.aggs.myAggs.terms.field = fieldName;
  const histogram = await client.search(searchBody);

  return histogram;
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
exports.bulkIndex = bulkIndex;
exports.getHistogram = getHistogram;
exports.getTermsAgg = getTermsAgg;
exports.getFieldedHistogram = getFieldedHistogram;
