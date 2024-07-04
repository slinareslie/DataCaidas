import express from "express";
import moment from "moment-timezone";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import readline from "readline";

const app = express();
const port = 8081;

app.use(express.json());
let storedData = [];
let toggleVar = 0;

const csvFilePath = path.resolve('diegoSinCaer4.csv');
const csvWriter = createObjectCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'id', title: 'ID' },
    { id: 'ax', title: 'AX' },
    { id: 'ay', title: 'AY' },
    { id: 'az', title: 'AZ' },
    { id: 'gx', title: 'GX' },
    { id: 'gy', title: 'GY' },
    { id: 'gz', title: 'GZ' },
    { id: 'timestamp', title: 'TIMESTAMP' },
    { id: 'toggleVar', title: 'TOGGLE_VAR' }
  ]
});

console.log(`Archivo CSV será guardado en: ${csvFilePath}`);

app.post('/data', (req, res) => {
  const { id, ax, ay, az, gx, gy, gz } = req.body;
  const timestamp = moment().tz("America/Lima").format();

  if (id && ax !== undefined && ay !== undefined && az !== undefined && gx !== undefined && gy !== undefined && gz !== undefined) {
    storedData.push({ id, ax, ay, az, gx, gy, gz, timestamp, toggleVar });
    res.send('Datos almacenados correctamente');
  } else {
    res.status(400).send('Error: Se requieren los campos "id", "ax", "ay", "az", "gx", "gy" y "gz"');
  }
});

app.get('/data', (req, res) => {
  if (storedData.length !== 0) {
    res.json(storedData);
  } else {
    res.status(404).send('Error: No hay datos almacenados');
  }
});

const saveDataToCSV = () => {
  if (storedData.length !== 0) {
    csvWriter.writeRecords(storedData)
      .then(() => {
        console.log('Los datos han sido guardados en data1.csv');
      })
      .catch((error) => {
        console.error('Error al guardar los datos en data1.csv:', error);
      });
  } else {
    console.log('No hay datos para guardar.');
  }
};

process.on('SIGINT', () => {
  console.log('SIGINT signal received: saving data to CSV.');
  saveDataToCSV();
  setTimeout(() => process.exit(), 1000);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: saving data to CSV.');
  saveDataToCSV();
  setTimeout(() => process.exit(), 1000);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (input) => {
  if (input === '\u0013') {
    console.log('Guardando datos en CSV...');
    saveDataToCSV();
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
