const { response } = require('express');

class M3UController {
    async parseM3U(req, res) {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL del archivo M3U es requerida." });
        }
        try {
            const m3uService = require('../services/m3uService');
            const parsedData = await m3uService.parseM3U(url);
            console.log('Datos parseados:', parsedData);

            const response = await this.buildResponse(parsedData);
            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Error al analizar el archivo M3U." });
        }
    }

    async searchM3U(req, res) {
        const { url, title, limit } = req.body;

        if (!url || !title) {
            return res.status(400).json({ error: "URL y título son requeridos." });
        }

        try {
            const m3uService = require('../services/m3uService');
            const parsedData = await m3uService.parseM3U(url);
            console.log('Datos parseados:', parsedData);

            // Verificar que cada elemento tenga una propiedad title
            const filteredData = parsedData.filter(item => {
                if (!item.title) {
                    console.error('Elemento sin título:', item);
                    return false;
                }
                return item.title.toLowerCase().includes(title.toLowerCase());
            }).slice(0, limit);

            console.log('Datos filtrados:', filteredData);

            if (filteredData.length === 0) {
                return res.status(404).json({ error: "No se encontraron resultados para el título proporcionado." });
            }

            const response = await this.buildResponse(filteredData);

            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Error al analizar el archivo M3U." });
        }
    }

    async determineUrl(req, res) {
        const { id } = req.params;
        const m3uService = require('../services/m3uService');
        const urlList = m3uService.getUrls();
        const item = urlList.find(item => item.id === id);
        const getData = await m3uService.parseM3U(item.url);
        console.log('Datos parseados:', getData);


        if (!item) {
            return res.status(404).json({ error: "ID no encontrado." });
        }

        try {
            const response = await this.buildResponse(getData);
            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Error al analizar el archivo M3U." });
        }
    }

    async buildResponse(parsedData) {
        return {
            providerName: "Roku Developers",
            language: "en-US",
            lastUpdated: new Date().toISOString(),
            listm3u8: parsedData.map(item => ({
                longDescription: "Learn how streaming works on the Roku platform. This video explains how content is delivered from a content delivery network (CDN) to a Roku device via a content feed",
                thumbnail: item.logo,
                releaseDate: "2020-01-15",
                genres: "educational",
                tags: "getting-started",
                id: "52ac61e1bfc2459aae0388731616ac9f",
                shortDescription: "Learn how streaming works on the Roku platform. This video explains how content is delivered from a content delivery network (CDN) to a Roku device via a content feed",
                title: item.title,
                videoType: "HLS",
                url: item.url,
                quality: "HD"
            }))
        };
    }
}

module.exports = M3UController;