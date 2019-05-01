const elastic = require('./lib/elastic.js');
const db = require('./lib/database.js');

const {
    Client
} = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
    log: 'error'
})

const buildProfiles = async () => {
	profiles = [];
	try {
		let sql = 'select distinct partner, target, keywords from partners';
		let results = await db.all(sql);
		for (let profileData of results) {
			let partnerIndex = profiles.findIndex((e) => {return e.partner === profileData.partner});
			if (partnerIndex < 0) {
				if (profileData.keywords && profileData.keywords !== '') {
					profiles.push({
						partner: profileData.partner,
						targets: [{
							target: profileData.target,
							keywords: [profileData.keywords]
						}]
					});
				} else {
					profiles.push({
						partner: profileData.partner,
						targets: [{
							target: profileData.target,
							keywords: []
						}]
					});
				}
			} else {
				let targetIndex = profiles[partnerIndex].targets.findIndex((e) => {return e.target === profileData.target});
				if (targetIndex >= 0) {
					if (profileData.keywords && profileData.keywords !== '') {
						let keywordIndex = profiles[partnerIndex].targets[targetIndex].keywords.findIndex((e) => {return e === profileData.keywords});
						if (keywordIndex < 0) {
							profiles[partnerIndex].targets[targetIndex].keywords.push(profileData.keywords);
						}
					}
				} else {
					if (profileData.keywords && profileData.keywords !== '') {
						profiles[partnerIndex].targets.push({
							target: profileData.target,
							keywords: [profileData.keywords]
						})
					} else {
						profiles[partnerIndex].targets.push({
							target: profileData.target,
							keywords: []
						})
					}
				}
			}
		}
		// console.log('profiles: ' + JSON.stringify(profiles,null,2));
		return profiles;
	} catch (err) {
		console.log(err);
	}
}

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



const addPercolatorQueries = async function(indexName, mappingName) {
		const profiles = await buildProfiles();
        const inserts = [];
        profiles.forEach(item => {
            let partner = item.partner;
            let targets = item.targets;
            let targetCounter = 1;
            targets.forEach(target => {
                let keywords = target.keywords;
                let keywordCounter = 1;
                keywords.forEach(keyword => {
                    const json = {"query": {"match":{"summary":keyword}}};
                    inserts.push(insertDoc(indexName, partner + '_' + target.target + '_' + keywordCounter, mappingName, json));
                    keywordCounter++;
                })
                targetCounter++;
            })
        })
		return await Promise.all(inserts);
};

const setup = async function() {
     await db.open('db.sqlite');
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


setup();
