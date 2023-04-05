const express = require('express');
// const { chromium } = require('playwright');

const app = express();
const port = process.env.PORT || 3000;




let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}



app.get('/', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('Missing "url" parameter.');
  }
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const content = await page.content();
    res.send(content);
  } catch (error) {
    res.status(500).send('Error rendering the URL: ' + error.message);
  } finally {
    await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
