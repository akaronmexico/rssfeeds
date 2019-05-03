const db = require('./database.js');

const getPartnerData = async function(partner, from, to) {
	try {
		let sql = ''
		let inserts = []
		if (partner) {
			sql = 'select * from partnerdata where partner=?';
			inserts = [partner]
		} else {
			sql = 'select * from partnerdata';
		}
		let rows = await db.all(sql, inserts);
		return rows;
	} catch (e) {
		console.log(e);
	}
}

const getPartners = async function(partner) {
}

exports.getPartnerData = getPartnerData;
exports.getPartners = getPartners;
