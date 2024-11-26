const m3uService = require('../services/m3uService');

class M3UController {
    
    async parseM3U(req, res) {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL del archivo M3U es requerida." });
        }
        try {
            const parsedData = await m3uService.parseM3U(url);
            console.log('Datos parseados:', parsedData);

            const response = await this.buildResponse(parsedData);
            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Error al analizar el archivo M3U." });
        }
    }

    async searchM3U(req, res) {
        const { url, title } = req.body;

        if (!url || !title) {
            return res.status(400).json({ error: "URL y título son requeridos." });
        }

        try {
            const parsedData = await m3uService.parseM3U(url);
            console.log('Datos parseados:', parsedData);

            // Verificar que cada elemento tenga una propiedad title
            const filteredData = parsedData.filter(item => {
                if (!item.title) {
                    console.error('Elemento sin título:', item);
                    return false;
                }
                return item.title.toLowerCase().includes(title.toLowerCase());
            });

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

    async parseIPTVJson(req, res) {
        const { type } = req.params;
        let parsedData;
        if (!type) {
            return res.status(400).json({ error: "El parámetro 'type' son requerido." });
        }
        try {
            if (type === 'store-series') {
                parsedData = await m3uService.mapAndFillSeriesData();
            }else{
                parsedData = await m3uService.parseIPTVUrl(type);
            }
            console.log('Datos parseados:', parsedData);

            //const response = await this.buildResponse(parsedData);
            return res.json(parsedData);
        } catch (error) {
            return res.status(500).json({ error: "Error al analizar la url JSON. =>" + error});
        }
    }

    async determineUrl(req, res) {
        const { id } = req.params;
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

    async searchByTitle(req, res) {
        const { title,id } = req.params;
        if (!title || !id) {
            return res.status(400).json({ error: "El parámetro 'title' e 'id' son requerido." });
        }

        try {
            const urlList = m3uService.getUrls();
            const item = urlList.find(item => item.id === id);
            const parsedData = await m3uService.parseM3U(item.url);

            // Verificar que cada elemento tenga una propiedad title
            const filteredData = parsedData.filter(item => {
                if (!item.title) {
                    console.error('Elemento sin título:', item);
                    return false;
                }
                return item.title.toLowerCase().includes(title.toLowerCase());
            });

            if (filteredData.length === 0) {
                return res.status(404).json({ error: "No se encontraron resultados para el título proporcionado." });
            }

            const response = await this.buildResponse(filteredData);
            return res.json(response);
        } catch (error) {
            return res.status(500).json({ error: "Error al analizar los archivos M3U." });
        }
    }

    async getGroupedEpisodes(req, res) {
        const { seriesId } = req.params;
        if (!seriesId) {
            return res.status(400).json({ error: "El parámetro 'seriesId' es requerido." });
        }

        try {
            const groupedData = await m3uService.groupEpisodesBySeason(seriesId);
            return res.json({
                providerName: "Roku Developers",
                language: "en-US",
                lastUpdated: new Date().toISOString(),
                series:[
                        groupedData
                ]});
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener los episodios agrupados." });
        }
    }


    async mapAndFillSeries(req, res) {

        try {
            const filledSeriesData = await m3uService.mapAndFillSeriesData();
            return res.json(filledSeriesData);
        } catch (error) {
            return res.status(500).json({ error: "Error al mapear y llenar los datos de las series." });
        }
    }

    async getStoredSeries(req, res) {
        try {
            const storedSeriesData = await m3uService.getStoredSeriesData();
            
            return res.json({
                providerName: "Roku Developers",
                language: "en-US",
                lastUpdated: new Date().toISOString(),
                series:[
                    ...storedSeriesData
            ]});
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener los datos almacenados de las series." });
        }
    }
    
    async mapAndFillSeries(req, res) {
        const { datalimit } = req.query; // Obtener datalimit de los parámetros de consulta
        try {
            const filledSeriesData = await m3uService.mapAndFillSeriesData(datalimit ? parseInt(datalimit) : undefined);
            return res.json(filledSeriesData);
        } catch (error) {
            return res.status(500).json({ error: "Error al mapear y llenar los datos de las series." });
        }
    }
    
    async getPaginatedSeries(req, res) {
        const { page = 1, limit = 10 } = req.query; // Obtener page y limit de los parámetros de consulta
        try {
            const paginatedSeriesData = await m3uService.getPaginatedSeriesData(parseInt(page), parseInt(limit));
            return res.json(...paginatedSeriesData);
        } catch (error) {
            return res.status(500).json({ error: "Error al obtener los datos paginados de las series." });
        }
    }

    async buildResponse(parsedData) {
        const response = parsedData;
        return {
            providerName: "Roku Developers",
            language: "en-US",
            lastUpdated: new Date().toISOString(),
            items: response.map(item => ({
                longDescription: item,
                thumbnail: item,
                releaseDate: item,
                genres: item,
                tags: item,
                id: item.id,
                shortDescription: item,
                title: item,
                content: {
                    duration: item,
                    videos: item,
                    language: item,
                    dateAdded: item
                }
            }))
        };
    }
}

module.exports = M3UController;