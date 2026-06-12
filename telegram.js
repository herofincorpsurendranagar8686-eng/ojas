import axios from "axios";

export async function sendTelegram(message) {
  try {
    console.log("========== TELEGRAM DEBUG ==========");
    console.log(
      "BOT_TOKEN:",
      process.env.BOT_TOKEN ? "FOUND" : "MISSING"
    );
    console.log(
      "CHANNEL_USERNAME:",
      process.env.CHANNEL_USERNAME
    );

    const url =
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

    const response = await axios.post(url, {
      chat_id: process.env.CHANNEL_USERNAME,
      text: message,
      disable_web_page_preview: false
    });

    console.log("SUCCESS");
    console.log(response.data);

  } catch (err) {
    console.log("========== TELEGRAM ERROR ==========");

    if (err.response) {
      console.log(
        JSON.stringify(
          err.response.data,
          null,
          2
        )
      );
    } else {
      console.log(err.message);
    }
  }
}
