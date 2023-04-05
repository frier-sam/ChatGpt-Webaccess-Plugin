const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = process.env.PORT || 3000;

app.get('/proxy', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        res.status(400).send('Error: URL parameter is missing');
        return;
    }

    try {
        const browser = await chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });

        const content = await page.content();
        await browser.close();

        res.send(content);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
