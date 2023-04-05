const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    const { url } = req.query;

    if (!url) {
        res.status(400).send('Error: URL parameter is missing');
        return;
    }

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.content();
        await browser.close();

        res.send(content);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
};
