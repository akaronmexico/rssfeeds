const express = require("express");
const helmet = require("helmet");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const port = 4000;
const partnerTables = require("./lib/fillPartner");
const createOutput = require("./lib/output");
const profile = require("./lib/profile");
const feeds = require("./lib/feeds");
const db = require("./lib/database.js");


app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
require("./routes")(app);

app.get("/fill", async (req, res) => {
  await partnerTables.fillPartnerTables();
  res.send("Done.");
});

app.get("/output", async (req, res) => {
  await createOutput.createOutput();
  res.send("Done.");
});

app.use("/ui", express.static("web"));
app.use("/ui-app", express.static("web-app"));
app.listen(port, '192.168.20.110',async () => {
  await db.open("db.sqlite");
  await db.run("PRAGMA foreign_keys = ON");

  feeds.addFeeds();
  console.log(`listening on port ${port}!`);
});
