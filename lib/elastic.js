const {
    Client
} = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200'
})
const db = require('./database.js');

const createIndex = () = {
    try {
        let result = await client.indices.exists({
            index: 'feeds'
        })
        if (result !== 200) {
            result = await client.indices.create({
                index: 'feeds'
            })

            await client.indices.putMapping({
                index: 'feeds',
                body: {
                    "properties": {
                        "query": {
                            "type": "percolator"
                        },
                        "field": {
                            "type": "text"
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.log(e)
    }
}

const indexPercolators = () => {

}