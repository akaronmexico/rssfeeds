const db = require('./database.js');
const partnerTables = require('./fillPartner');

const elastic = require('./elastic.js');
let profiles = 
[{
	partner: 'sdfg',
	targets: [{
		target: 'hgdf',
		keywords: ['One', 'Two']
	}]
}]
let partnersList = [{
	name: 'cv',
	targets: ['AB', 'NM']
}]
let bins = [{
	name: 'xz',
	keywords: ['One', 'Two']
}]
let profileMatch = [{
	target: 'AB',
	bin: 'xz',
	keywords: ['One', 'Two']
}]

const itemOrSummary = (arr, item) => {
	return arr.filter((a) => {
		return item.title.includes(a) || item.summary.includes(a);
	});
}

const newProfile = async (item) => {
	let matches = [];
	for (let partner of partnersList) {
		let targets = itemOrSummary(partnersList.targets, item);
		for (let bin of bins) {
			let keywords = itemOrSummary(bin.keywords, item);
			if (targets.length > 0) {
				for (let target of targets) {
					matches.push({target: target, bin: bin.name, keywords: keywords});
				}
			} else {
				matches.push({target: '', bin: bin.name, keywords: keywords});
			}
		}
	}
	await insertMatches(matches, item); // todo, what are we doing here?
}



const profileItem = async (item) => {
	const matches = [];
	let summaryHits = 0;
	let titleHits = 0;
	const summaryPercolate = await elastic.percolate(item.summary);
	
	 if (summaryPercolate.hits.total > 0) {
		 // uncomment to see what percolate hits from elastic look like...
		/* console.log("*******\t" + item.title + "   matched " + perc.hits.total + " max score: " + perc.hits.max_score);
		   console.log(JSON.stringify(perc.hits.hits,null,2));
		   console.log("*************************************"); */
		 if(summaryPercolate.hits.hits) {
			summaryPercolate.hits.hits.forEach( async hit => {
				summaryHits++;
				const score = hit._score;
				const bin = hit._id;
				const keyword = hit._source.query.match.summary;
				const partner = bin.split("_")[0];
				const target = bin.split("_")[1];
				await partnerTables.fillTable(item, score, partner, target, keyword, new Date().toISOString());
			})
		 }
	 }
	 
	 // run same percolate query against title
	 
	 const titlePercolate = await elastic.percolate(item.title);
	
	 if (titlePercolate.hits.total > 0) {
		
		 if(titlePercolate.hits.hits) {
			titlePercolate.hits.hits.forEach( async hit => {
				titleHits++;  // do we want to count each percolate that hit as a hit?  or just count as one if it matches multiple?
				const score = hit._score;
				const bin = hit._id;
				const keyword = hit._source.query.match.summary;
				const partner = bin.split("_")[0];
				const target = bin.split("_")[1];
				await partnerTables.fillTable(item, score, partner, target, keyword, new Date().toISOString());
			})
		 }
	 }
	if(titleHits > 0 || summaryHits > 0 ) {
		console.log("# summary hits:\t" + summaryHits + "\t# title hits:\t" + titleHits + "\t" + item.title);
	}

	 
	 
	/*for (let profile of profiles) {
		for (let target of profile.targets) {
			if (item.title.includes(target.target) || item.summary.includes(target.target)) {
				 console.log(item.title + ' matched to ' + profile.partner);
				await partnerTables.fillTable(item, profile.partner, target.target, '', new Date().toISOString());
			}
			if (target.keywords.length > 0) {
				for (keyword of target.keywords) {
                    if (item.title.includes(target.target) && item.title.includes(keyword) ||
						item.summary.includes(target.target) && item.summary.includes(keyword) ||
						item.title.includes(keyword) && item.summary.includes(target.target) ||
						item.title.includes(target.target) && item.summary.includes(keyword)) {
						// We need to make keywords column a list in partnerdata, we never match in here since all the articles already matched on just the target.
						 console.log(item.title + ' target and keyword to ' + profile.partner);
						await partnerTables.fillTable(item, profile.partner, profile.partner, keyword, new Date().toISOString());
					}
					if (item.title.includes(keyword) || item.summary.includes(keyword)) {
						 console.log(item.title + ' keyword to ' + profile.partner);
						await partnerTables.fillTable(item, profile.partner, '', keyword, new Date().toISOString());
					}
				}
			}
		}
	}*/
}

const resetProfile = async () => {
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
	} catch (err) {
		console.log(err);
	}
}

exports.resetProfile = resetProfile;

exports.profileItem = profileItem;
