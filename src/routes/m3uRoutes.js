const express = require('express');
const M3UController = require('../controllers/m3uController');

const router = express.Router();
const m3uController = new M3UController();

router.post('/parse-m3u', m3uController.parseM3U.bind(m3uController));
router.post('/search-m3u', m3uController.searchM3U.bind(m3uController));
router.get('/determine-url/:id', m3uController.determineUrl.bind(m3uController)); // Nueva ruta
router.get('/search-by-title/:title/:id', m3uController.searchByTitle.bind(m3uController)); // Nueva ruta
router.get('/iptv-json', m3uController.parseIPTVJson.bind(m3uController)); // Nueva ruta

module.exports = router;