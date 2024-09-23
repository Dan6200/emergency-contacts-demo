import { Page } from "puppeteer";
import { browser, page } from "./set-browser";
import assert from "node:assert";

interface EmergencyContacts {
  resId: string;
  name: string;
  phoneNumber: string;
}

interface Resident {
  resId: string;
  name: string;
  noOfEmergencyContacts: number;
  room: string;
  address: string;
}

page.setDefaultTimeout(100_000); // 100 seconds default timeout for all actions
await page.goto("https://linkidlogin.com/admin");
await page.locator('input[name="username"]').fill("trenarigroup");
await page.locator('input[name="password"]').fill("Exit2022!");
await page.locator('input[type="submit"]').click();
await findCustomerData(page);

async function findCustomerData(page: Page) {
  await page.locator('a[href="/admin/MemberManagement/"]').click();
  await page.locator('input[name="search"]').fill("ccyoung");
  await page.locator('td > input[type="image"]').click();
  await page.locator(".basic_table tr > td").click();
  const buttons = await _locator(page, ".basic_table #button a");
  await buttons[0].click();
  await delay(10_000);
  const [, page2] = await browser.pages();
  await page2.locator("#btn_go_new_trumpia").click();
  await scrapeCustomerData(page2);
}

async function scrapeCustomerData(page: Page) {
  await delay(30_000);
  let tableBtns = await _locator(page, "td");
  let maxCount = tableBtns.length;
  assert(maxCount > 2);
  let count = 2;
  while (count < maxCount) {
    await tableBtns[count].click();
    console.log(await getResId(page));
    await page.locator(".btn-header-back").click();
    await delay(5_000);
    tableBtns = await _locator(page, "td");
    maxCount = tableBtns.length;
    count += 7;
  }
}

async function getResId(page: Page) {
  await delay(5_000);
  const textSelector = await page.locator("dl > dd").waitHandle();
  return textSelector?.evaluate((el) => el.textContent?.split(" ")[0]);
}

export async function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function _locator(page: Page, selector: string) {
  await page.waitForSelector(selector);
  return page.$$(selector);
}
