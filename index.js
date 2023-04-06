const express = require('express');
// const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const YAML = require('yamljs');
const fs = require('fs');


app.use(cors());

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
    await page.goto(url, { waitUntil: 'networkidle2' });
    const textContent = await page.evaluate(() => {
      return document.body.innerText;
    });
    res.send(textContent);
  } catch (error) {
    res.status(500).send('Error rendering the URL: ' + error.message);
  } finally {
    await browser.close();
  }
});

app.get('/.well-known/ai-plugin.json', async (req, res) => {
    const content = {
        "schema_version": "v1",
        "name_for_human": "Get Updated Info Plugin",
        "name_for_model": "GetUpdatedInfo",
        "description_for_human": "Plugin to get updated info of any url. you can send the url and get the data of that url.",
        "description_for_model": "Plugin to get updated info of any url. you can send the url and get the current updated data of that url. ",
        "auth": {
          "type": "none"
        },
        "api": {
          "type": "openapi",
          "url": "http://localhost:3000/openapi.yaml",
          "is_user_authenticated": false
        },
        "logo_url": "http://localhost:3333/logo.png",
        "contact_email": "support@example.com",
        "legal_info_url": "http://www.example.com/legal"
      }
    return res.send(content);
      
  });




app.get('/openapi.yaml', async (req, res) => {
    fs.readFile('openapi.yaml', 'utf8', (err, data) => {
        if (err) {
          res.status(500).json({ error: 'Error reading YAML file' });
          return;
        }
    
        res.setHeader('Content-Type', 'text/yaml');
        res.status(200).send(data);
      });
});



app.listen(port, () => {
console.log(`Proxy server listening at http://localhost:${port}`);
});