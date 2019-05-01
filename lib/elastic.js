const fs = require('fs');
const {
    Client
} = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
    log: 'error'
})

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
                        "bin": {
                            "type": "text"
                        },
                        "keywords": {
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

const bulkIndex = function bulkIndex(index, data) {
		let bulkBody = [];
		
		data.forEach(item => {
			bulkBody.push({
				index: {
					_index: index,
					_id: item.id
				}
			});

			bulkBody.push(item);
		});
		
		esClient.bulk({body: bulkBody})
		.then(response => {
			let errorCount = 0;
			response.items.forEach(item => {
				if (item.index && item.index.error) {
					console.log(++errorCount, item.index.error);
				}
			});
			console.log(`Successfully indexed ${data.length - errorCount} out of ${data.length} items`);
		})
		.catch(console.err);
	};

const indexPercolators = () => {

}

const test = function test() {
		const binsJSON = fs.readFileSync('bins.json');
		const bins = JSON.parse(binsJSON);
		console.log(`${bins.length} items parsed from data file`);
		bulkIndex('feeds', bins);
	};

	test();
