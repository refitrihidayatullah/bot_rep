const telegramBot = require("node-telegram-bot-api");

const token = "7071953469:AAG4O_p74tn92QoKUKEfcnuDqEn6iz146q8";

console.log("bot ready!");

const options = {
  polling: true,
};
const AllApiDoa = "https://doa-doa-api-ahmadramadhan.fly.dev/api/";

async function getListDoa() {
  try {
    const response = await fetch(AllApiDoa);
    if (!response.ok) {
      throw new Error(`Http error, status : ${response.status}`);
    }
    const data = await response.json();
    const listDoaNew = data
      .map((item) => item.doa.toLowerCase().replace(/\s+/g, ""))
      .filter((item) => item);
    console.log(listDoaNew);
    return listDoaNew;
  } catch (err) {
    console.error("error fetching data: ", err);
    return [];
  }
}

const repbot = new telegramBot(token, options);

const prefix = "!";

// Regex untuk perintah
const salam = new RegExp(`^${prefix}assalamualaikum$`);
const botmaafinaku = new RegExp(`^botmaafinaku$`);
const yaudahkudeleteaja = new RegExp(`^yaudahkudeleteaja$`);
const gempa = new RegExp(`^${prefix}gempa$`);

async function handleDoa(callback, endpoint) {
  try {
    const callDoa = await fetch(endpoint);
    const res = await callDoa.json();
    const [data] = res;
    const { id, doa, ayat, latin, artinya } = data;
    const message = `
        Berikut ${doa} ~repp
        ${doa}
        ${ayat}
        ${latin}
        ${artinya}
        note ketik /start untuk melihat list doa yang tersedia
        `;
    console.log(message);
    repbot.sendMessage(callback.from.id, message);
  } catch (error) {
    repbot.sendMessage(
      callback.from.id,
      `Terjadi kesalahan saat mengambil data ${doa}`
    );
  }
}

// anonymous function
(async () => {
  // call function getListDoa
  const listDoa = await getListDoa();
  for (let i = 0; i < listDoa.length; i++) {
    const regex = new RegExp(`^${listDoa[i]}$`, "i");
    const apiUrl = `https://doa-doa-api-ahmadramadhan.fly.dev/api/${i + 1}`;
    repbot.onText(regex, (callback) => handleDoa(callback, apiUrl));
  }
})();

repbot.onText(salam, (callback) => {
  const username = callback.from.username;
  repbot.sendMessage(callback.from.id, `waalaikumsalam ${username} ~repp`);
});
repbot.onText(botmaafinaku, (callback) => {
  const username = callback.from.username;
  repbot.sendMessage(callback.from.id, `gamaooo!! 😡 ${username} ~repp`);
});
repbot.onText(yaudahkudeleteaja, (callback) => {
  const username = callback.from.username;
  repbot.sendMessage(
    callback.from.id,
    `kumaafin kok tehe~ 😚 ${username} ~repp`
  );
});

// Menangkap perintah /start untuk mengirim pesan pengantar
repbot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const listDoaNew = await getListDoa();
    const message = `
    Selamat datang di Bot Doa Harian ~repp 😐😐😐!
  
    Berikut adalah beberapa perintah yang dapat Anda gunakan:
    
    ${listDoaNew
      .map(
        (doa, index) =>
          `${index + 1} . ${doa} => untuk mendapatkan ${doa} ~repp`
      )
      .join("\n")}

    
    Silakan ketik perintah yang sesuai dengan kebutuhan Anda.😐
      `;
    repbot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    console.error("Terjadi Kesalahan", error);
  }
});

repbot.onText(gempa, async (callback) => {
  try {
    const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";
    const callApi = await fetch(BMKG_ENDPOINT + "autogempa.json");
    const {
      Infogempa: {
        gempa: {
          Jam,
          Magnitude,
          Tanggal,
          Wilayah,
          Potensi,
          Dirasakan,
          Shakemap,
        },
      },
    } = await callApi.json();
    const BMKGImage = BMKG_ENDPOINT + Shakemap;
    // console.log(BMKGImage);

    const resultText = `
  Tanggal : ${Tanggal}
  Jam : ${Jam}
  Magnitude: ${Magnitude}
  Wilayah: ${Wilayah}
  Potensi: ${Potensi}
  Dirasakan: ${Dirasakan}`;

    const hem = "https://data.bmkg.go.id/DataMKG/TEWS/20240521153454.mmi.jpg";
    await repbot.sendPhoto(callback.from.id, BMKGImage, {
      caption: resultText,
    });

    console.log("Photo sent successfully");
  } catch (error) {
    console.error("Error:", error);
    repbot.sendMessage(
      callback.from.id,
      "Terjadi kesalahan saat mengambil data gempa."
    );
  }
});

module.exports = (req, res) => {
  res.status(200).send("Bot is running");
};
