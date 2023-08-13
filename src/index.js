const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 3030;
// const url = "http://localhost:3030"
const api_key = process.env.API_KEY;
const url_yt_statistics = `https://www.googleapis.com/youtube/v3/channels?part=snippet%2C%20statistics&key=${api_key}`;
const url_yt_videos = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=4&key=${api_key}`;

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3030', 'https://dudu-ytdata.vercel.app']
}));

app.get("/api/statistics/:id", async (req, res) => {
  try {
    const urlResponse = await fetch(`${url_yt_statistics}&id=${req.params.id}`);
    const data = await urlResponse.json();

    const { title, customUrl, publishedAt, thumbnails } = data.items[0].snippet; //ARRUMAR
    const { viewCount, subscriberCount, videoCount } = data.items[0].statistics;

    const dadosCanal = { title, customUrl, publishedAt, thumbnails };
    const countCanal = { viewCount, subscriberCount, videoCount };

    const dados = { ...dadosCanal, ...countCanal };

    res.send(dados);
  } catch (error) {
    console.error(`Erro estatisticas: ${error}`);
  }
});

app.get("/api/videos/:id", async (req, res) => {
  try {
    const urlResponse = await fetch(
      `${url_yt_videos}&playlistId=${req.params.id}`
    );
    const response = await urlResponse.json();
    // console.log(response)

    // console.log(`${url_yt_videos}&playlistId=${req.params.id}`)
    if (response.error) {
        return res.json([])
    }
    const datas = response.items.map(async (item) => {
      const { publishedAt, title, thumbnails, resourceId } = item.snippet;
      const dados = { publishedAt, title, thumbnails, resourceId };
      return dados;
    });

    const infosVideo = await Promise.all(datas);

    const mapeando = infosVideo.map(async (info) => {
      try {
        const urlResponse = await fetch(
          `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&key=${api_key}&id=${info.resourceId.videoId}`
        );
        const response = await urlResponse.json();

        const { viewCount, likeCount, commentCount } =
          response.items[0].statistics;

        const videoCounts = { viewCount, likeCount, commentCount };
        const infoVideo = { ...info, ...videoCounts };

        return infoVideo;
      } catch (error) {
        console.error(`Erro mapeando: ${error}`);
      }
    });

    const videosStatistics = await Promise.all(mapeando);
    return res.send(videosStatistics);

  } catch (error) {
    console.error(`Erro map: ${error}`);
  }
});

// app.get(`/api/statistics`, (req, res) => {
//     fetch(`${url_yt_statistics}&id=${req.body.id}`)
//     .then(response => response.json())
//     .then(data => {
//         const {title, customUrl, publishedAt, thumbnails} = data.items[0].snippet
//         const {viewCount, subscriberCount, videoCount} = data.items[0].statistics
//         // const { medium } = thumbnails
//         const dadosCanal = {title, customUrl, publishedAt, thumbnails}
//         const countCanal = {viewCount, subscriberCount, videoCount}
//         const dados = {...dadosCanal, ...countCanal}

//         res.send(dados)
//     })
//     .catch(error => console.error(error))
// })

// app.get(`/api/videos`, (req, res) => {
//     fetch(`${url_yt_videos}&playlistId=${req.body.id}`)
//     .then(response => response.json())
//     .then(data => {
//         const tempData = [];
//         data.items.forEach((item) => {
//             const {publishedAt, title, thumbnails, resourceId} = item.snippet
//             const dados = {publishedAt, title, thumbnails, resourceId};
//             tempData.push(dados)
//         })
//         return tempData;
//     })
//     .then(async tempData => {

//         var mapeando = tempData.map(async (data) => {

//             return fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=statistics&key=${api_key}&id=${data.resourceId.videoId}`)
//             .then(response => response.json())
//             .then(blabla => {
//                 const {viewCount, likeCount, commentCount} = blabla.items[0].statistics
//                 const counts = {viewCount, likeCount, commentCount}
//                 const lalala = {...data, ...counts}

//                 return lalala;
//             })
//             .catch(error => console.error(error))

//         })

//         var lelele = await Promise.all(mapeando);
//         res.send(lelele);

//     })
//     .catch(error => console.error(error))
// })

app.listen(port, () => {
  console.log("O servidor ta aberto na porta " + port + " pai");
});
