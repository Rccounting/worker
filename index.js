require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

const log = require('simple-node-logger').createSimpleLogger(opts = {
    logFilePath:process.env.LOG_FILE,
    timestampFormat:process.env.LOG_DATE_FORMAT
});

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.APP_PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

function sleep(timeout) {
    return new Promise((res, rej) => {
        setTimeout(res, timeout);
    });
}

app.post('/', function (req, res) {
    (async () => {
        log.info(`PDF Creation...`);
        log.info(`Browser Instance creating....`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        log.info(`Browser Instance created....`);
        const page = await browser.newPage()
        log.info(`Created empty page`);
        await page.setContent(req.body.content);
        log.info(`Set Page Content`);
        await page.setDefaultNavigationTimeout(0);
        log.info(`Browser Rendering...`);
        await sleep(process.env.TIME_OF_WAIT);

        var path = await page.title()+'.pdf';
        var pdf = await page.pdf();
        await browser.close();
        log.info(`${path} was created`);

        res.contentType("application/pdf");
        res.setHeader('title', path); // For naming file
        log.info(`Sending file to client...`);
        res.send(pdf);
    })();
});

app.get('/ping', (req, res) => res.send('Pong!') && log.info(`Ping`));

app.listen(PORT, function (err) {
    console.log(`Worker listen on ${PORT}`)
    if (err) console.log(err);
});