const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors"); // CORS modülünü dahil et
const app = express();

app.use(cors({
    origin: '*' // tüm cihazlardan gelen fetch isteklerine izin verir
}));

  mongoose.connect('mongodb+srv://elmastekyazilim:8Rug3mWAC6Exkgh@cluster0.oswmayz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB bağlantı hatası:'));

// Veri modeli
const QrRecord = mongoose.model('QrRecord', new mongoose.Schema({
    qrData: String,
    result: String,
    description: String,
    timestamp: { type: Date, default: Date.now },
    username: { type: String, default: 'staticUser' } // Statik kullanıcı adı
}));

// JSON verilerini almak için body-parser kullanımı
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// API Endpoint'i: QR verisini MongoDB'ye kaydet
app.post('/submit-qr-data', (req, res) => {
    
    const { qrData, result, description } = req.body;
    console.log(qrData);
    const newQrRecord = new QrRecord({
        qrData: qrData,
        result: result, // "Test OK" veya "Test Fail"
        description: description,
    });

    newQrRecord.save()
        .then(() => res.status(201).send({ message: 'Veri başarıyla kaydedildi.' }))
        .catch(err => res.status(500).send({ message: 'Veri kaydedilirken bir hata oluştu.', error: err }));
});

// Statik HTML dosyasını sunma
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// SSL Sertifika ayarları
const options = {
    key: fs.readFileSync("cert/server.key"),
    cert: fs.readFileSync("cert/server.cert"),
};

// HTTPS Sunucu Başlatma
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ${PORT} port çalışıyor`);
});