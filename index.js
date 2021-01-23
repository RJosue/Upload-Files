const express = require("express");
const multer = require('multer');
const app = express()
const fs = require('fs');
const port = process.env.PORT || 4000;
var masterPath = `./content`; //ruta principal donde se guardara el archivo
var defaultPath = "/";

app.listen(port, () => {
    console.log('Server is up in ' + port)
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path = `${masterPath}${req.filePath || defaultPath}`;
        req.filePath = req.filePath || defaultPath;
        // Se verifica y crean las carpetas para guardar el archivo
        if (!fs.existsSync(`${path}`)) {
            fs.mkdir(`${path}`, { recursive: true }, function (err) {
                if (err) {
                    return cb({
                        title: "Ocurrio un error con las rutas del archivo.",
                        icon: "error"
                    }, null);
                }
            });
        }
        return cb(null, path);
    },
    filename: function (req, file, cb) {
        // Se limpia el nombre del archivo
        let fileName = file.originalname
            .replace(/\s/g, '_')
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().split(".");

        req.fileName = `${fileName[0]}_${Date.now()}.${fileName[1]}`; // Nombre del archivo
        if (req.extendsValids) {
            let extendIsValid = req.extendsValids.some(ext => ext == fileName); // validacion de las extensiones 
            if (!extendIsValid)
                return cb({
                    title: "Tipo de archivo invalido",
                    icon: "error"
                }, null);
        }
        cb(null, `${fileName[0]}_${Date.now()}.${fileName[1]}`)
    }
});

const upload = multer({ storage }).single("file");

app.post('/upload', async function (req, res) {
    // req.extendsValids = ["pdf"];  Array con las extenciones validas del archivo
    let result = await new Promise((resolve) => {
        upload(req, res, function (error, result) {
            var result = { success: false };
            if (error) {
                result.noti = error;
                return resolve(result);
            }
            result.success = true;
            resolve(result);
        });
    })
    res.send(result);
});