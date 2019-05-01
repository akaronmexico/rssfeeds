const fs = require('fs');
const {
    Client
} = require('elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
    log: 'error'
})


const dropIndex = async function(indexName) {
    console.log("dropping index: " + indexName);
    return await client.indices.delete({index: indexName}).catch(err => {console.log("caught error dropping index: " + err); return null});
}

const addMapping = async function(indexName, mapping){
      console.log("creating mapping for index: " + indexName);
    return await client.indices.putMapping({
        index: indexName,
        type: '_doc',
        body: mapping
    }).catch(err => {console.error("caught mapping error: " + err);});
}

const createIndex = async function(indexName) {
    console.log("creating index: " + indexName);
        return await client.indices.create({
                index: indexName
        });
}

const insertDoc = async function(indexName, _id, mappingType, data) {
    console.log(indexName + ": adding document with id: " + _id);
        return await client.index({
           index: indexName,
           id: _id,
           type: mappingType,
           body: data 
        });
}


const indexPercolators = () => {

}

const addPercolatorQueries = async function(indexName, mappingName) {
		const binsJSON = fs.readFileSync('./lib/bins.json');
		const data = JSON.parse(binsJSON);
        const inserts = [];
        data.forEach(item => {
           // console.log("item: " + JSON.stringify(item,null,2));
            let tags = item.tags;
            let tagCounter = 1;
           // console.log("tags: " + JSON.stringify(tags,null,2));
            tags.forEach(tag => {
                const json = {"query": {"match":{"summary":tag}}};
                console.log("tags: " + JSON.stringify(json,null,2));
                inserts.push(insertDoc(indexName, item.id + '_' + tagCounter, mappingName, json));
                tagCounter++;
            })
        })
		return await Promise.all(inserts);
};

const percolate = async function(summaryText) {
    const body = {
        query: {
            percolate: {
                field: 'query',
                document: {
                    "summary": summaryText
                }
            }
        }
    }
    return await client.search({index: 'articles', body: body})
}


const setup = async function(closeConnection) {
    const percMapping = {
         properties: {
             summary: {
                type: "text"
            },
             query: {
                 type: "percolator"
             }
         }
    } 
    
    const mapping = {
               properties: {
                    summary: {
                        type: "text"
                    },
                    query: {
                        type: "percolator"
                    }
                }
    }
    
    const dropResponse =  await dropIndex('articles');
    const createIndexResponse = await createIndex('articles');
    const createMappingResponse = await addMapping('articles',mapping);
    const percolatorIndexResponse = await addPercolatorQueries('articles','_doc');
    client.close();
   
}

exports.percolate = percolate;
exports.setup = setup;


