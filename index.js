const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios").default;
const probe = require("probe-image-size");

//Helpers
const headers = {
  "Prediction-Key": "19e35c2b9d1347c3bb760a505635db62",
  "Content-Type": "application/json",
};

const API_URL =
  "https://westus2.api.cognitive.microsoft.com/customvision/v3.0/Prediction/12f38ef1-3e82-454d-859e-b981dcd1204f/detect/iterations/pruebaDetec/url";

const img_url =
  "https://es.himgs.com/imagenes/estar-bien/20190215137141/razas-perro-pequenos-gt/0-645-998/perros-miniatura-a.jpg";

//Functions
const predict = async (Url) => {
  let data = null;
  await axios
    .post(API_URL, { Url: Url }, { headers: headers })
    .then((response) => {
      data = response.data;
    });

  //Filters
  const predictionsFiltered = [];
  data.predictions.forEach((x) => {
    x.probability = Number(x.probability) * 100;
    if (x.probability > 20) {
      predictionsFiltered.push(x);
    }
  });
  data.predictions = predictionsFiltered;

  return data;
};

const originalWidth = (img, value) => {
  return (value * 100) / img.width; //%
};

const originalHeight = (img, value) => {
  return (value * 100) / img.height; //vh
};

const originalX = (img, value) => {
  return (value * 100) / img.width; //%
};

const originalY = (img, value) => {
  return (value * 100) / img.height;
};

const draw = (prediction, img) => {
  let x = prediction.boundingBox.left * img.width; //X in pix
  let y = prediction.boundingBox.top * img.height; //Y in pix
  let width = prediction.boundingBox.width * img.width; //Width in pix
  let height = prediction.boundingBox.height * img.height; //Height in pix
  //Refresh items
  width = originalWidth(img, width);
  height = originalHeight(img, height);
  x = originalX(img, x);
  y = originalY(img, y);

  console.log(
    "Element: ",
    prediction.tagName,
    "Width: ",
    width,
    "Height: ",
    height,
    "X: ",
    x,
    "Y: ",
    y
  );
  switch (prediction.tagName) {
    case "madafakon":
      return `
        <img src="https://sketch2code.azurewebsites.net/Content/img/fake_img.svg" class="img-fluid" alt="Responsive image" style="position:absolute;width:${width}%;height:${height}vh;top:${y}%;left:${x}%"/>
      `;
      break;

    default:
      break;
  }
};

const sketchHTML = (prediction, img) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Test</title>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css"
      />
  
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.min.js"></script>
  
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js"></script>
    </head>
    <body>
        <div class="position-relative"  style="height: 100vh;">
          ${prediction.predictions.map((x) => draw(x, img))}
        </div>
    </body>
  </html>
  
  `;
};

//Routes

const test = async (req, res) => {
  //Get the prediction with filters
  const img = await probe(img_url);
  console.log("Image size: ", img.width, " ", img.height);
  const prediction = await predict(img_url);
  //To html
  // prediction.predictions.forEach((x) => {
  //   console.log(
  //     "Probabilidad: " + x.tagName,
  //     "Left: " + x.boundingBox.left,
  //     "Top: " + x.boundingBox.top,
  //     "Width: " + x.boundingBox.width,
  //     "Height: " + x.boundingBox.height
  //   );
  // });
  const html = sketchHTML(prediction, img);
  res.send(html);
};

//Config
app.get("/", test);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
