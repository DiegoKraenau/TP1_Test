const compressing = require("compressing");
const fs = require("fs-extra");
const ncp = require("ncp").ncp;

//Helpers
const views = [
  {
    viewName: "View1",
    content: "<html>",
  },
  {
    viewName: "View2",
    content: "<div>",
  },
];

const manageTemplate = (template) => {
  switch (template) {
    case "React":
      return "./Templates/ReactTemplate";
    default:
      break;
  }
};

//Functions

const addViews = (view, folderName) => {
  fs.outputFile(
    `./CopyTemplates/${folderName}/src/views/${view.viewName}.js`,
    view.content,
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
};

const compress = async (name) => {
  //Map with views
  for (const view of views) {
    await addViews(view, name);
  }
  // await fs.outputFile("./CopyTemplates/Diego_1/prueba/t.txt", "hello!");
  //Zip
  await compressing.zip
    .compressDir(`./CopyTemplates/${name}`, `./SendTemplates/${name}.zip`)
    .then((res) => {
      console.log("Comprimido");
    })
    .catch((err) => {
      console.log(err);
    });

  return `${name}.zip`;
};

const copyTemplateToFolder = async (nameProject, id, template) => {
  //Create the folder
  const folderName = nameProject + "_" + id;
  const dir = `./CopyTemplates/${folderName}`;
  if (!(await fs.exists(dir))) {
    await fs.mkdir(dir);
  }

  //Move files of template inside new folder
  const srcDir = manageTemplate(template);
  const destDir = `./CopyTemplates/${folderName}`;
  await fs.copy(srcDir, destDir, { overwrite: true });
};

const testDownload = async (req, res) => {
  //Copy template to copy folder
  const id = 1;
  const nameProject = "Diego";
  await copyTemplateToFolder(nameProject, id, "React");
  //Send zip
  const compressName = await compress(`${nameProject + "_" + id}`);
  res.download(`./SendTemplates/${compressName}`);
};

module.exports = { testDownload };

//Links
// Compress : https://www.npmjs.com/package/compressing
// Copy folder : https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
// fs: https://www.w3schools.com/nodejs/nodejs_filesystem.asp
