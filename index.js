const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

// use Render's default installed Chromium
const CHROME_PATH = process.env.CHROME_BIN || '/usr/bin/google-chrome-stable';

app.get('/usdt', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://th.upbit.com/exchange?code=CRIX.UPBITC_THB-USDT', {
      waitUntil: 'networkidle2'
    });

    const price = await page.evaluate(() => {
      const el = document.querySelector('.mainPrice');
      return el ? el.innerText.replace(',', '') : null;
    });

    await browser.close();

    if (price) {
      res.json({ price: parseFloat(price) });
    } else {
      res.status(500).json({ error: 'Price not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
