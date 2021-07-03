'use strict';

const puppeteer = require('puppeteer');
const epub = require('epub-gen');

const options = {
  title: '',
  author: '',
  output: './folder/file.epub',
  content: [],
};

// This is where we'll put the code to get around the tests.
const preparePageForTests = async (page) => {
  // Pass the User-Agent Test.
  const userAgent =
    'Mozilla/5.0 (X11; Linux x86_64)' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
};

const scrapepage = async (urls) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  for (let i = 0; i < urls.length; i++) {
    try {
      console.log('started', urls[i]);
      const page = await browser.newPage();
      await preparePageForTests(page);
      await page.goto(urls[i], { waitUntil: 'load' });
      //   await page.screenshot({
      //     path: './screenshot.jpg',
      //     type: 'jpeg',
      //     fullPage: true,
      //   });
      const chapter = await page.evaluate(() => {
        let title = document.querySelector('.main-title').innerText;
        let text = Array.from(
          document.querySelectorAll('.par.fontsize-16>p'),
          (element) => `<p>${element.innerText}</p>`
        );
        return {
          title: title,
          data: text.join(''),
        };
      });
      //   console.log('CHAPTER', chapter);
      options.content.push(chapter);
      await page.close();
      console.log('ended');
    } catch (error) {
      console.log(error);
    }
  }
  await browser.close();
};

const links = [];

scrapepage(links).then((response) =>
  new epub(options).promise.then(() => console.log('Done'))
);
