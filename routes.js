const api = require("./lib/api.js");

module.exports = app => {
  app.get("/api/partnerboards", async (req, res) => {
    const result = await api.getPartnerBoards();
    res.send(result);
  });
  app.get("/api/partnerdata", async (req, res) => {
    const result = await api.getPartnerData();
    res.send(result);
  });

  app.get("/api/partnerdata/:partner", async (req, res) => {
    const result = await api.getPartnerData(req.params.partner);
    res.send(result);
  });

  app.get("/api/partners", async (req, res) => {
    const result = await api.getPartners();
    res.send(result);
  });

  app.get("/api/targets/:partnerId", async (req, res) => {
    const result = await api.getTargets();
    res.send(result);
  });

  app.get("/api/bins", async (req, res) => {
    const result = await api.getBins();
    res.send(result);
  });

  app.get("/api/keywords/:binId", async (req, res) => {
    const result = await api.getKeywords(req.params.binId);
    res.send(result);
  });

  app.get("/api/feeds", async (req, res) => {
    const result = await api.getFeeds();
    res.send(result);
  });

  app.post("/api/partners", async (req, res) => {
    const result = await api.createPartners(req.body);
    res.send(result);
  });

  app.post("/api/targets", async (req, res) => {
    const result = await api.createTargets(req.body);
    res.send(result);
  });

  app.post("/api/bins", async (req, res) => {
    const result = await api.createBins(req.body);
    res.send(result);
  });

  app.post("/api/keywords", async (req, res) => {
    const result = await api.createKeywords(req.body);
    res.send(result);
  });

  app.post("/api/feeds", async (req, res) => {
    const result = await api.createFeeds(req.body);
    res.send(result);
  });

  app.put("/api/partners", async (req, res) => {
    const result = await api.updatePartners(req.body);
    res.send(result);
  });

  app.put("/api/targets", async (req, res) => {
    const result = await api.updateTargets(req.body);
    res.send(result);
  });

  app.put("/api/bins", async (req, res) => {
    const result = await api.updateBins(req.body);
    res.send(result);
  });

  app.put("/api/keywords", async (req, res) => {
    const result = await api.updateKeywords(req.body);
    res.send(result);
  });

  app.put("/api/feeds", async (req, res) => {
    const result = await api.updateFeeds(req.body);
    res.send(result);
  });

  app.delete("/api/partners/:partnerId", async (req, res) => {
    const result = await api.deletePartners(req.params.partnerId);
    res.send(result);
  });

  app.delete("/api/targets/:targetId", async (req, res) => {
    const result = await api.deleteTargets(req.params.targetId);
    res.send(result);
  });

  app.delete("/api/bins/:binId", async (req, res) => {
    const result = await api.deleteBins(req.params.binId);
    res.send(result);
  });

  app.delete("/api/keywords/:keywordId", async (req, res) => {
    const result = await api.deleteKeywords(req.params.keywordId);
    res.send(result);
  });

  app.delete("/api/feeds/:feedId", async (req, res) => {
    const result = await api.deleteFeeds(req.params.feedId);
    res.send(result);
  });

  app.get("/api/partnerdata/from/:fromDate", async (req, res) => {
    // TODO
    const result = await api.getPartnerData(null, req.params.fromDate);
    res.send(result);
  });

  app.get("/api/partnerdata/from/:fromDate/to/:toDate", async (req, res) => {
    // TODO
    const result = await api.getPartnerData(
      null,
      req.params.fromDate,
      req.params.toDate
    );
    res.send(result);
  });

  app.get("/api/partnerdata/:partner/from/:fromDate", async (req, res) => {
    // TODO
    const result = await api.getPartnerData(
      req.params.partner,
      req.params.fromDate
    );
    res.send(result);
  });

  app.get(
    "/api/partnerdata/:partner/from/:fromDate/to/:toDate",
    async (req, res) => {
      // TODO
      const result = await api.getPartnerData(
        req.params.partner,
        req.params.fromDate,
        req.params.toDate
      );
      res.send(result);
    }
  );

  app.get("/api/boards", async (req, res) => {
    // TODO select distinct partners?
    const result = await api.getBoards();
    res.send(result);
  });

  app.get("/api/titles", async (req, res) => {
    // TODO select * from titles
    const result = await api.getPartners();
    res.send(result);
  });
};
