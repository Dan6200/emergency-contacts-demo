import { appendFile } from "fs/promises";
import findCustomerData from "./find-customer-data.js";
import login from "./login.js";
import { page } from "./set-browser.js";
import Resident from "./types.js";

const ssNo = 0;
const residents: Resident[] = [];

try {
  await login(page);
  await findCustomerData(page, residents, ssNo);
} catch (e) {
  console.log("An error occurred!");
  console.error(e);
} finally {
  console.log("written to file!");
  await appendFile("data/raw_data.json", JSON.stringify(residents, null, 2));
}
