import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function sendTelegram(message) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHANNEL_USERNAME,
        text: message,
        parse_mode: "HTML"
      }
    );

    console.log("Telegram message sent");
  } catch (err) {
    console.error("Telegram Error:", err.message);
  }
}
