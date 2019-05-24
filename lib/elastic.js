const fs = require("fs");
const { Client } = require("elasticsearch");
const moment = require("moment");

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

const bulkIndex = async bulk => {
  return await client.bulk({ body: bulk });
};

const getTermsAgg = async (fieldName, dateRangeStr) => {
  const searchObj = {
    index: "partnerdata",
    type: "partnerarticle",
    body: {
      size: 0,
      aggs: {
        top_terms: {
          terms: {
            field: ""
          }
        }
      }
    }
  };
  searchObj.body.aggs.top_terms.terms.field = fieldName;
  const termsAgg = await client.search(searchObj);
  const buckets = termsAgg.aggregations.top_terms.buckets;
  const metrics = [];
  for (let i = 0; i < buckets.length; i++) {
    const b = buckets[i];
    metrics.push({ keyword: b.key, count: b.doc_count });
  }
  return metrics;
};

const getDetailedFieldedHistogram = async (
  fieldName,
  fieldValue,
  dateRangeStr,
  interval = "1h"
) => {
  const searchBody = {
    index: "partnerdata",
    type: "partnerarticle",
    body: {
      size: 0,
      aggs: {
        myAggs: {
          terms: {
            field: fieldName
          },
          aggs: {
            fieldHistogram: {
              date_histogram: {
                field: "date",
                interval: interval,
                min_doc_count: 0
              }
            }
          }
        }
      }
    }
  };
  if (dateRangeStr && dateRangeStr !== "") {
    searchBody.body["query"] = {
      bool: {
        must: [
          {
            term: {}
          },
          {
            range: {
              date: {
                gte: "now-" + dateRangeStr,
                lt: "now/d+1d"
              }
            }
          }
        ]
      }
    };

    searchBody.body.query.bool.must[0].term[fieldName] = fieldValue;
  }
  const histogram = await client.search(searchBody);
  const buckets = histogram.aggregations.myAggs.buckets;
  const metrics = [];
  for (let i = 0; i < buckets.length; i++) {
    const b = buckets[i];
    const entry = {
      key: b.key,
      count: b.doc_count,
      buckets: []
    };
    let entryBuckets = b.fieldHistogram.buckets;
    for (let j = 0; j < entryBuckets.length; j++) {
      const b2 = entryBuckets[j];
      const d = {
        key: moment(b2.key_as_string).format("LLL"),
        count: b2.doc_count
      };
      entry.buckets.push(d);
    }
    metrics.push(entry);
  }
  return metrics;
};

const getFieldedHistogram = async (
  fieldName,
  dateRangeStr,
  interval = "1h"
) => {
  const searchBody = {
    index: "partnerdata",
    type: "partnerarticle",
    body: {
      size: 0,
      aggs: {
        myAggs: {
          terms: {
            field: ""
          },
          aggs: {
            fieldHistogram: {
              date_histogram: {
                field: "date",
                interval: interval,
                min_doc_count: 0
              }
            }
          }
        }
      }
    }
  };
  if (dateRangeStr && dateRangeStr !== "") {
    searchBody.body["query"] = {
      range: {
        date: {
          gte: "now-" + dateRangeStr,
          lt: "now/d+1d"
        }
      }
    };
  }
  // console.log("search body:  "+ JSON.stringify(searchBody,null,2));
  searchBody.body.aggs.myAggs.terms.field = fieldName;
  const histogram = await client.search(searchBody);
  //console.log("histogram: " + JSON.stringify(histogram.aggregations.myAggs.buckets,null,2));
  const buckets = histogram.aggregations.myAggs.buckets;
  const metrics = [];
  for (let i = 0; i < buckets.length; i++) {
    const b = buckets[i];
    const entry = {
      key: b.key,
      count: b.doc_count,
      buckets: []
    };
    let entryBuckets = b.fieldHistogram.buckets;
    for (let j = 0; j < entryBuckets.length; j++) {
      const b2 = entryBuckets[j];
      const d = {
        key: moment(b2.key_as_string).format("LLL"),
        count: b2.doc_count
      };
      entry.buckets.push(d);
    }
    metrics.push(entry);
  }
  return metrics;
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
exports.getDetailedFieldedHistogram = getDetailedFieldedHistogram;
