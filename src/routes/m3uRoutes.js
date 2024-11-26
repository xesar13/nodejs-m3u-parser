const express = require('express');
const M3UController = require('../controllers/m3uController');

const router = express.Router();
const m3uController = new M3UController();

router.post('/parse-m3u', m3uController.parseM3U.bind(m3uController));
router.post('/search-m3u', m3uController.searchM3U.bind(m3uController));
router.get('/determine-url/:id', m3uController.determineUrl.bind(m3uController)); // Nueva ruta
router.get('/search-by-title/:title/:id', m3uController.searchByTitle.bind(m3uController)); // Nueva ruta
router.get('/iptv-json/:type', m3uController.parseIPTVJson.bind(m3uController)); // Nueva ruta
router.get('/seasons/:seriesId', m3uController.getGroupedEpisodes.bind(m3uController)); // Nueva ruta
router.get('/get-all-series', m3uController.mapAndFillSeries.bind(m3uController)); // Nueva ruta
router.get('/get-stored-series', m3uController.getStoredSeries.bind(m3uController)); // Nueva ruta
router.get('/get-paginated-series', m3uController.getPaginatedSeries.bind(m3uController)); // Nueva ruta

module.exports = router;