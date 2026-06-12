import axios from "axios";

export async function sendTelegram(message) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHANNEL_USERNAME,
        text: message,
        disable_web_page_preview: false
      }
    );

    console.log("Telegram sent");
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
}
