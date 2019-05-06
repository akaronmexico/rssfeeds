const api = require('./lib/api.js');

module.exports = (app) => {

    app.get('/api/partnerdata', async (req, res) => {
        const result = await api.getPartnerData();
        res.send(result);
    });

    app.get('/api/partnerdata/:partner', async (req, res) => {
        const result = await api.getPartnerData(req.params.partner);
        res.send(result);
    });
    
    app.get('/api/partners', async (req, res) => {
        const result = await api.getPartners();
        res.send(result);
    });
    
    app.get('/api/targets/:partnerId', async (req, res) => {
        const result = await api.getTargets();
        res.send(result);
    });
    
    app.get('/api/bins', async (req, res) => {
        const result = await api.getBins();
        res.send(result);
    });
    
    app.get('/api/keywords/:binId', async (req, res) => {
        const result = await api.getKeywords(req.params.binId);
        res.send(result);
    });
    
    app.post('/api/partners', async (req, res) => {
        const result = await api.createPartners(req.body);
        res.send(result);
    });
    
    app.post('/api/targets', async (req, res) => {
        const result = await api.createPartners(req.body);
        res.send(result);
    });
    
    app.post('/api/bins', async (req, res) => {
        const result = await api.createBins(req.body);
        res.send(result);
    });
    
    app.post('/api/keywords', async (req, res) => {
        const result = await api.createKeywords(req.body);
        res.send(result);
    });
    
    app.put('/api/partners', async (req, res) => {
        const result = await api.createPartners(req.body);
        res.send(result);
    });
    
    app.put('/api/targets', async (req, res) => {
        const result = await api.createPartners(req.body);
        res.send(result);
    });
    
    app.put('/api/bins', async (req, res) => {
        const result = await api.updateBins(req.body);
        res.send(result);
    });
    
    app.put('/api/keywords', async (req, res) => {
        const result = await api.updateKeywords(req.body);
        res.send(result);
    });
    
    app.get('/api/partnerdata/from/:fromDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(null, req.params.fromDate);
        res.send(result);
    });
    
    app.get('/api/partnerdata/from/:fromDate/to/:toDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(null, req.params.fromDate, req.params.toDate);
        res.send(result);
    });
    
    app.get('/api/partnerdata/:partner/from/:fromDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(req.params.partner, req.params.fromDate);
        res.send(result);
    });
    
    app.get('/api/partnerdata/:partner/from/:fromDate/to/:toDate', async (req, res) => {
		// TODO
        const result = await api.getPartnerData(req.params.partner, req.params.fromDate, req.params.toDate);
        res.send(result);
    });
    
    app.get('/api/boards', async (req, res) => {
		// TODO select distinct partners?
        const result = await api.getBoards();
        res.send(result);
    });
    
    app.get('/api/titles', async (req, res) => {
		// TODO select * from titles
        const result = await api.getPartners();
        res.send(result);
    });
}
