const db = require('./database.js');
const partnerTables = require('./fillPartner');

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

const itemOrSummary = (a, item) => {
	return item.title.includes(a) || item.summary.includes(a); // not going to quite work yet.
}

const newProfile = async (item) => {
	let matches = [];
	for (let partner of partnersList) {
		let targets = partnersList.targets.filter(itemOrSummary, item);
		for (let bin of bins) {
			let keywords = bin.keywords.filter(itemOrSummary, item);
			if (targets.length > 0) {
				for (let target of targets) {
					matches.push({target: target, bin: bin.name, keywords: keywords});
				}
			} else {
				matches.push({target: '', bin: bin.name, keywords: keywords});
			}
		}
	}
	await insertMatches(matches); // todo, what are we doing here?
}


const profileItem = async (item) => {
	for (let profile of profiles) {
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
	}
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
		console.log('profile reset');
	} catch (err) {
		console.log(err);
	}
}

exports.resetProfile = resetProfile;

exports.profileItem = profileItem;
