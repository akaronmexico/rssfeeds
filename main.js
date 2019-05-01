const express = require('express');
const helmet = require('helmet');
const app = express();
const port = 3000;
const partnerTables = require('./lib/fillPartner');
const createOutput = require('./lib/output');
const profile = require('./lib/profile');
const feeds = require('./lib/feeds');
const db = require('./lib/database.js');
const elastic = require('./lib/elastic.js');

app.use(helmet());

app.get('/fill', async (req, res) => 
    {
        await partnerTables.fillPartnerTables();
        res.send("Done.");
    }
);

app.get('/output', async (req, res) => 
    {
        await createOutput.createOutput();
        res.send("Done.");
    }
);

app.use('/ui', express.static('web'));

app.listen(port, async () => {
    await elastic.setup();
   // await db.open('db.sqlite');
   // await profile.resetProfile();
   // feeds.addFeeds();
    console.log(`listening on port ${port}!`);
});
