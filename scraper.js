import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";
import { sendTelegram } from "./telegram.js";

dotenv.config();

const URL =
  "https://ojas.gujarat.gov.in/AdvtList.aspx?type=lCxUjNjnTp8=";

function loadOldJobs() {
  try {
    if (!fs.existsSync("jobs.json")) return [];
    return JSON.parse(fs.readFileSync("jobs.json", "utf8"));
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  fs.writeFileSync(
    "jobs.json",
    JSON.stringify(jobs, null, 2)
  );
}

async function scrapeJobs() {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36"
  });

  try {
    console.log("Opening OJAS...");

    await page.goto(URL, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    await page.waitForSelector("#ddlDept", {
      timeout: 30000
    });

    const deptValues = await page.$$eval(
      "#ddlDept option",
      options =>
        options
          .map(o => o.value)
          .filter(v => v && v !== "0")
    );

    console.log(
      `Departments Found: ${deptValues.length}`
    );

    const allJobs = [];

    for (const dept of deptValues) {
      try {
        console.log(`Checking Department: ${dept}`);

        await page.selectOption("#ddlDept", dept);

        await page.waitForTimeout(3000);

        const jobs = await page.evaluate(
          currentDept => {
            const rows = document.querySelectorAll(
              "#dgJobList tr"
            );

            const result = [];

            rows.forEach((row, index) => {
              if (index === 0) return;

              const td =
                row.querySelectorAll("td");

              if (td.length >= 5) {
                result.push({
                  advtNo:
                    td[0]?.innerText.trim() || "",
                  title:
                    td[1]?.innerText.trim() || "",
                  endDate:
                    td[2]?.innerText.trim() || "",
                  fees:
                    td[3]?.innerText.trim() || "",
                  contact:
                    td[4]?.innerText.trim() || "",
                  dept: currentDept
                });
              }
            });

            return result;
          },
          dept
        );

        allJobs.push(...jobs);

        console.log(
          `Jobs Found: ${jobs.length}`
        );
      } catch (e) {
        console.log(
          `Department Failed: ${dept}`
        );
      }
    }

    await browser.close();

    return allJobs;
  } catch (err) {
    await browser.close();
    console.error(err);
    return [];
  }
}

async function main() {
  const oldJobs = loadOldJobs();

  const jobs = await scrapeJobs();

  if (!jobs.length) {
    console.log("No jobs found");
    return;
  }

  const oldIds = new Set(
    oldJobs.map(j => j.advtNo)
  );

  const newJobs = jobs.filter(
    j => !oldIds.has(j.advtNo)
  );

  console.log(
    `New Jobs Found: ${newJobs.length}`
  );

  for (const job of newJobs) {
    const message = `
🔥 NEW OJAS RECRUITMENT

📌 ${job.title}

🆔 Advertisement:
${job.advtNo}

📅 Last Date:
${job.endDate}

🌐 OJAS Gujarat
https://ojas.gujarat.gov.in
`;

    await sendTelegram(message);
  }

  saveJobs(jobs);

  console.log(
    `Total Jobs Saved: ${jobs.length}`
  );
}

main();
