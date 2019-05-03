const api = require('./lib/api.js');

module.exports = (app) => {

    app.get('/api/get/partnerdata', async (req, res) => {
        const result = await api.getPartnerData();
        res.send(result);
    });

    app.get('/api/get/partnerdata/:partner', async (req, res) => {
        const result = await api.getPartnerData(req.params.partner);
        res.send(result);
    });
    
    app.get('/api/get/partnerdata/from/:fromDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(null, req.params.fromDate);
        res.send(result);
    });
    
    app.get('/api/get/partnerdata/from/:fromDate/to/:toDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(null, req.params.fromDate, req.params.toDate);
        res.send(result);
    });
    
    app.get('/api/get/partnerdata/:partner/from/:fromDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(req.params.partner, req.params.fromDate);
        res.send(result);
    });
    
    app.get('/api/get/partnerdata/:partner/from/:fromDate/to/:toDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(req.params.partner, req.params.fromDate, req.params.toDate);
        res.send(result);
    });
    
    app.get('/api/get/partners', async (req, res) => {
		// TODO select distinct partners?
        const result = await api.getPartners();
        res.send(result);
    });
    
    app.get('/api/get/keywords/:partner', async (req, res) => {
		// TODO select distinct keywords where partner=?  ought we do a one-many table for keywords? probs
        const result = await api.getPartners(req.params.partner);
        res.send(result);
    });
    
    app.get('/api/get/titles', async (req, res) => {
		// TODO select * from titles
        const result = await api.getPartners();
        res.send(result);
    });
}
