// cspell:ignore btns
import { Page } from "puppeteer";
import Resident from "./types.js";
import { delay, _locator } from "./utils.js";

export async function getCustomerData(
  page: Page,
  residents: Resident[],
  ssNo: number
) {
  await page.screenshot({
    fullPage: true,
    path: `data/screenshots/${++ssNo}.jpg`,
  });
  await page.select("#base-select", "100");
  await delay(2_000);
  let residentCount = 100;
  let pageNo = 2;

  while (await page.$(".btn-range-next")) {
    let count = 2 + 100 * 7;

    while (pageNo <= 3) {
      for (let i = 1; i < pageNo; i++) {
        await page.locator(".btn-range-next").click();
        await delay(2_000);
      }

      await delay(32_000);
      await page.screenshot({
        fullPage: true,
        path: `data/screenshots/${++ssNo}.jpg`,
      });
      let tableBtns = await _locator(page, "td");
      let maxCount = tableBtns.length * 7 - 5;
      console.log(count, maxCount);
      if (count > maxCount) {
        if (pageNo > 3) return;
        count = 2;
        continue;
      } else {
        await tableBtns[count].click();
        await delay(35_000);
      }
      const data = await getData(page);
      if (!data.length) throw new Error("Empty data");
      const resId = await getResId(data);
      const address = await getAddress(data);
      const name = await getResidentName(data);
      const addressData = address.split(" ");
      const room = addressData[addressData.length - 1].match(/\d+./)?.[0];
      const emergencyContact = await getEmergencyContact(data);
      const resident: Resident = {
        name,
        noOfEmergencyContacts: emergencyContact?.length ?? 0,
        resId,
        address,
        room: room,
        emergencyContact,
      };
      console.log("resident no", residentCount++);
      console.log(resident);
      residents.push(resident);
      await page.locator(".btn-header-back").click();
      await page.select("#base-select", "100");
      await delay(5_000);
      count += 7;
    }
  }
}

async function getEmergencyContact(data: any[]) {
  return data[5]?.match(
    /.*(\+?\d{1,3} )?(\(\d{3}\)|\d{3})(-| )\d{3}(-| )\d{4}.*/g
  );
}

async function getResidentName(data: any[]) {
  return data[5]
    ?.match(/Resident.*/)?.[0]
    .split(":")
    .map((s: any) => s.trim())[1];
}

async function getData(page: Page) {
  await page.waitForSelector("dl > dd p");
  return page.$$eval("dl > dd p", (el: any[]) =>
    el.map((el) => el.textContent)
  );
}

async function getAddress(data: any[]) {
  return data[1];
}

async function getResId(data: any[]) {
  return data[0].split(" ")[0];
}
