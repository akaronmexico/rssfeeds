const fs = require('fs');
const {
    Client
} = require('elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
    log: 'error'
})

const checkIndex = () => {
    console.log("checking for index");
    return client.indices.exists({index: 'feeds'})
    .then(response => {dropIndex();})
    .catch(err => {console.log('Caught error checking index: ' + err);});
}

const dropIndex = async function(indexName) {
    console.log("dropping index");
    return await client.indices.delete({index: indexName});
}

const addMapping = async function(indexName, mappingType, mapping){
      console.log("creating mapping for index: " + indexName);
    return await client.indices.putMapping({
        index: indexName,
        type: mappingType,
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
           type: mappingType,
           id: _id,
           body: data 
        });
}


const indexPercolators = () => {

}

const addToIndex = async function(indexName, mappingName) {
		const binsJSON = fs.readFileSync('./lib/bins.json');
		const data = JSON.parse(binsJSON);
        const inserts = [];
        data.forEach(item => {
          inserts.push(insertDoc(indexName, item.id, mappingName, item));
        })
		return await Promise.all(inserts);
	};

const closeConnection = async function(){
    return await client.close();
}

const setup = async function() {
    const mapping = {
         properties: {
             bin: {
                 type: "text"
             },
             tags: {
                 type: "keyword"
             },
             query: {
                 type: "percolator"
             }
         }
    } 
    
    const dropResponse =  await dropIndex('feeds');
    const createIndexResponse = await createIndex('feeds');
    const createMappingResponse = await addMapping('feeds','perc', mapping);
    const indexResponse = await addToIndex('feeds','perc');
    const closeResponse = await closeConnection();
   
}

exports.setup = setup;


