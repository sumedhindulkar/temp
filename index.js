import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs/promises";
const USER_AGENT = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36`;
puppeteer.use(StealthPlugin());

const scrapeSchool = async (page) => {
  var name = null,
    address = null,
    email = null;
  try {
    name = await page.$eval("#main_body > h1 > span", (el) =>
      el.textContent.split(",")[0].trim()
    );
  } catch {}
  try {
    address = await page.$eval(
      "div.col-md-10.col-md-push-2 > div:nth-child(1) > div.col-md-4 > div",
      (el) => el.textContent.replace(/\n/g, "").trim()
    );
  } catch {}
  try {
    email = await page.$eval(
      " div.col-md-10.col-md-push-2 > div:nth-child(1) > div.col-md-4 > a",
      (el) => el.getAttribute("href").split("mailto:")[1]
    );
  } catch {}

  return { schoolName: name, schoolAddress: address, email };
};

const App = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    slowMo: 300,
  });
  const detailsPage = await browser.newPage();
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);

  const URL = "https://www.city-data.com/schools-dirs/schools-BC";
  await page.goto(URL + ".html", {
    waitUntil: "networkidle2",
  });

  for (let i = 0; i < 23; i++) {
    if (i !== 0) {
      await page.goto(URL + i + ".html", {
        waitUntil: "networkidle2",
      });
    }

    const allSchools = await page.$$(
      "div > div > table.table > tbody > tr > td >a"
    );

    for (let x of allSchools) {
      var schoolUrl = null;
      try {
        schoolUrl = await page.evaluate((el) => el.getAttribute("href"), x);
      } catch {}

      try {
        await detailsPage.goto("https://www.city-data.com" + schoolUrl, {
          waitUntil: "networkidle2",
        });
        const data = await scrapeSchool(detailsPage);
        await pushData(data);
      } catch (err) {
        console.log(err + "EEEEEEEEEEEEEE");
      }
    }
  }
};

App();

const pushData = async (data) => {
  let schools = [];
  const file = await fs.readFile("schools.json");
  schools = JSON.parse(file);
  schools.push(data);
  await fs.writeFile("schools.json", JSON.stringify(schools, null, 4));
};
