import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs/promises";
const USER_AGENT = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36`;
puppeteer.use(StealthPlugin());

const App = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    slowMo: 300,
  });
  const detailsPage = await browser.newPage();
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);

  const URL = "https://zety.com/blog/job-titles";
  await page.goto(URL, {
    waitUntil: "networkidle2",
  });

  const allJobTitles = await page.$$(
    "div.blog-main.blog-main--hiddenButton > ul > li"
  );
  console.log(allJobTitles.length);
  for (let x of allJobTitles) {
    var value = null;
    try {
      value = await page.evaluate((el) => el.textContent, x);

      await pushData({
        value,
        label: value,
      });
    } catch (err) {
      console.log(err + "EEEEEEEEEEEEEE");
    }
  }
};

App();

const pushData = async (data) => {
  let test = [];
  const file = await fs.readFile("test.json");
  test = JSON.parse(file);
  test.push(data);
  await fs.writeFile("test.json", JSON.stringify(test, null, 4));
};
