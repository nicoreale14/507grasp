// Vamos a comenzar con el BACKEND:

// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const FILE_PATH = './backend/inventario.xlsx';

// Leer archivo Excel y devolver como JSON
function readInventory() {
    const workbook = xlsx.readFile(FILE_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data;
}

// Escribir JSON al archivo Excel
function writeInventory(data) {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Inventario');
    xlsx.writeFile(workbook, FILE_PATH);
}

app.get('/productos', (req, res) => {
    const data = readInventory();
    res.json(data);
});

app.get('/productos/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const data = readInventory();
    const item = data.find(p => p.CODIGO === codigo);
    item ? res.json(item) : res.status(404).send('Producto no encontrado');
});

app.post('/productos', (req, res) => {
    const data = readInventory();
    data.push(req.body);
    writeInventory(data);
    res.status(201).send('Producto agregado');
});

app.put('/productos/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const data = readInventory();
    const index = data.findIndex(p => p.CODIGO === codigo);
    if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeInventory(data);
        res.send('Producto actualizado');
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

app.delete('/productos/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    let data = readInventory();
    const newData = data.filter(p => p.CODIGO !== codigo);
    if (newData.length < data.length) {
        writeInventory(newData);
        res.send('Producto eliminado');
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});