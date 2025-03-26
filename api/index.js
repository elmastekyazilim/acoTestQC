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
app.post('/submit-qr-data', async (req, res) => {
    const { qrData, result, description } = req.body;

    try {
        await QrRecord.findOneAndUpdate(
            { qrData: qrData }, // Sorgu: qrData'ya göre arar
            {
                qrData,
                result,
                description,
                timestamp: new Date(),
                username: 'staticUser'
            },
            { upsert: true, new: true } // varsa güncelle, yoksa oluştur
        );

        res.status(200).send({ message: 'Veri başarıyla güncellendi veya eklendi.' });
    } catch (err) {
        console.error('DB hatası:', err);
        res.status(500).send({ message: 'Veri işlenirken bir hata oluştu.', error: err });
    }
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