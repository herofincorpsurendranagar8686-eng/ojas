import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { sendTelegram } from "./telegram.js";

const URL = "https://www.ojasgujarat.net/ojas-bharti/";

function loadPosts() {
  try {
    if (!fs.existsSync("posts.json")) return [];
    return JSON.parse(fs.readFileSync("posts.json", "utf8"));
  } catch {
    return [];
  }
}

function savePosts(posts) {
  fs.writeFileSync(
    "posts.json",
    JSON.stringify(posts, null, 2)
  );
}

async function scrape() {
  const response = await axios.get(URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });

  const $ = cheerio.load(response.data);

  const posts = [];

  $("article").each((_, el) => {
    const title =
      $(el).find("h2 a, h3 a").first().text().trim();

    const link =
      $(el).find("h2 a, h3 a").first().attr("href");

    if (title && link) {
      posts.push({
        title,
        link
      });
    }
  });

  return posts;
}

async function main() {
  const oldPosts = loadPosts();

  const latestPosts = await scrape();

  const existingLinks = new Set(
    oldPosts.map(p => p.link)
  );

  const newPosts = latestPosts.filter(
    p => !existingLinks.has(p.link)
  );

  console.log(`Found ${latestPosts.length} posts`);
  console.log(`New ${newPosts.length} posts`);

  for (const post of newPosts.reverse()) {
    const msg =
`🔥 New OJAS Update

📌 ${post.title}

🔗 ${post.link}`;

    await sendTelegram(msg);
  }

  savePosts(latestPosts);
}

main().catch(console.error);
