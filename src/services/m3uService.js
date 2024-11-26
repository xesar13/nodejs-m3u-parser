const axios = require('axios');
const fs = require('fs');
const path = require('path');

class M3UService {
    constructor() {
        if (!M3UService.instance) {
            M3UService.instance = this;
        }
        return M3UService.instance;
    }
    extractDomain(url) {
        const { hostname } = new URL(url);
        return hostname;
    }
async  parseM3U(url) {
    try {
        const response = await axios.get(url);
        const data = response.data;

        const lines = data.split('\n');
        const parsedData = [];
        let currentItem = {};

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('#EXTINF:')) {
                const info = line.split(',');
                const attributes = info[0].split(' ');
                currentItem = {
                    title: (info[1] || '').trim(), // Eliminar espacios en blanco del inicio del título
                    thumbnail: 'pkg:/images/icon_focus_hd.png'
                };
                attributes.forEach(attr => {
                    if (attr.startsWith('tvg-logo=')) {
                        currentItem.thumbnail = attr.split('=')[1].replace(/"/g, '');
                    }
                });
            } else if (line && (line.startsWith('https') || line.startsWith('http'))) {
                currentItem.url = line;
                parsedData.push(currentItem);
                currentItem = {};
            }
        });

        return parsedData;
    } catch (error) {
        throw new Error('Error al obtener el archivo M3U');
    }
}

async  parseIPTVUrl(type) {
    const pLimit = (await import('p-limit')).default; // Importación dinámica de p-limit

    let getData;
    try {
        const configPath = this.getConfig();
        const { base_url, username, password, stream_types, stream_extensions, categories,menustart } = configPath;
        if (type === 'menu') {
            getData = menustart
        }
        const [streamAction, categoryAction] = stream_types[type];

            const responseCategories = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=${categoryAction}`);
            const categoriesData = responseCategories.data;
    
            const response = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=${streamAction}`);
            const data = response.data;
            //getData = this.getMoviesData(categoriesData,data,base_url, username, password, type);
        //getData = this.getMoviesData(categoriesData,data,base_url, username, password, type);
        if (type === 'movie') {
            getData = this.getMoviesData(categoriesData,data,base_url, username, password, type);
        } else if (type === 'series-by-categories') {
            
        const limit = pLimit(5); // Limitar a 5 solicitudes simultáneas
        getData = await limit(async () => {
                const seriesData = await this.getSeriesDataByCategories(categoriesData,data);
                return seriesData;
            });
        }else if (type === 'series') {
            
            getData = this.getMoviesData(categoriesData,data,base_url, username, password, type);

            }

        return {
            providerName: "Roku Developers",
            language: "en-US",
            lastUpdated: new Date().toISOString(),
            ...getData
        };
    } catch (error) {
        throw new Error('Error al obtener el archivo JSON: ' + error.message);
    }
}

 getUrls() {
    const filePath = path.join(__dirname, '../../urls.json');
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
}

 getConfig() {
    const filePath = path.join(__dirname, '../../config.json');
    if (!fs.existsSync(filePath)) {
        throw new Error('El archivo config.json no existe.');
    }
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
}


 generateId() {
    return Math.random().toString(36).substr(2, 16);
}

getSeriesData(base_url, username, password,  seriesData, seriesId) {
    if (!seriesData.seasons || !seriesData.episodes) {
        throw new Error('Datos de temporadas o episodios no encontrados');
    }

    let count = 0; // Inicializar el contador

    // Convertir seriesData.episodes en un arreglo
    const episodesArray = Object.values(seriesData.episodes);

    const seasons = seriesData.seasons
        .filter(season => episodesArray[season.season_number - 1]?.length > 0) // Omitir temporadas sin episodios
        .map(season => {
            const seasonNumber = season.season_number || 1;
            const episodes = episodesArray[seasonNumber - 1].map(episode => {
                const episodeNumbers = typeof episode.episode_num === 'string' ? parseInt(episode.episode_num) : episode.episode_num || (count + 1).toString(); // Asegurarse de que season_number sea válido
                const episodeData = {
                    id: `${episode.id}`,
                    title: episode.title,
                    episodeNumber: episodeNumbers,
                    content: {
                        dateAdded: episode.info.release_date,
                        videos: [{
                            videoType: episode.container_extension.toUpperCase() || 'MP4',
                            url: `${base_url}/series/${username}/${password}/${episode.id}.${episode.container_extension || 'mp4'}`,
                            quality: "HD"
                        }],
                        duration: episode.info.duration_secs,
                        captions: episode.subtitles.map(subtitle => ({
                            language: subtitle.language,
                            captionType: subtitle.type,
                            url: subtitle.url
                        })),
                        language: "en-us"
                    },
                    thumbnail: episode.info.movie_image,
                    shortDescription: episode.info.plot,
                    releaseDate: episode.info.release_date,
                    longDescription: episode.info.plot,
                    tags: ["series"],
                    genres: seriesData.info.genre ? seriesData.info.genre.split(',').map(genre => genre.trim()) : [],
                };
                count++; // Incrementar el contador
                return episodeData;
            });
            return {
                title: season.name,
                episodes: episodes
            };
        });

    return {

        id: `${seriesId}`,
        title: seriesData.info.title,
        releaseDate: seriesData.info.releaseDate,
        shortDescription: seriesData.info.plot,
        thumbnail: seriesData.info.cover,
        genres: seriesData.info.genre ? seriesData.info.genre.split(',').map(genre => genre.trim()) : [],
        tags: ["series"],
        seasons: seasons
        
    };
}

async getSeriesDataByCategories(categoriesData, data, categoryLimit = 1) {
    const filteredData = data.filter(item => categoriesData.some(category => category.category_id === item.category_id));
    const dataToUse = filteredData.length ? filteredData : data;
    const fillSeriesData = await this.mapAndFillSeriesData();

    const categorizedData = dataToUse.reduce((acc, item) => {
        const category = categoriesData.find(category => category.category_id === item.category_id);
        const categoryName = category ? category.category_name.trim() : 'Unknown';

        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName] = fillSeriesData;
        return acc;
    }, {});

    // Limitar el número de categorías
    const limitedCategories = Object.keys(categorizedData).slice(0, categoryLimit).reduce((acc, key) => {
        acc[key] = categorizedData[key];
        return acc;
    }, {});

    return limitedCategories;
}

getMoviesData(categoriesData,data,base_url, username, password,type){
    const filteredData = data.filter(item => categoriesData.some(category => category.category_id === item.category_id));
    const dataToUse = filteredData.length ? filteredData : data;

    const categorizedData = dataToUse.reduce((acc, item) => {
        const category = categoriesData.find(category => category.category_id === item.category_id);
        const categoryName = category ? category.category_name.trim() : 'Unknown';
           const parsedItem = {
            longDescription: 'Video that demonstrates the Roku automated channel testing software. It provides a brief overview of the technology stack, and it shows how both the Roku WebDriver and Robot Framework Library can be used for state-driven channel UI automation testing.',
            thumbnail: item.stream_icon || 'http://odenfull.co:2086/images/Kanmk96vTt-hjZj_mC4RcPttLMlmeeoOsTOSXqs4fWXm360tfVL4n72DiGcqnmJjEaLTx-pqpiKPRnq3r3oG1F5G-Ai9TBV7jxWp9OYRkVlvuPHnkAR6-rHFFEGQmOzy8SvYYtEdrb61VYjE1tzklg.png',
            releaseDate: '2020-01-20',
            genres: ['educational'],
            tags: [type],
            id: item.stream_id || item.series_id,
            shortDescription: 'Demonstrates the Roku automated channel testing software.',
            title: item.name,
            content: {
                duration: 713,
                videos: [{
                    videoType:  item.stream_type || 'm3u8',
                    url: `${base_url}/${type}/${username}/${password}/${item.stream_id || item.series_id}.${item.container_extension || 'm3u8'}`,
                    quality: 'HD'
                }],
                language: 'en-us',
                dateAdded: '2020-01-29T02:39:10Z'
            }
        };

        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(parsedItem);
        return acc;
    }, {});
    return categorizedData;
}
async mapAndFillSeriesData() {
    const pLimit = (await import('p-limit')).default; // Importación dinámica de p-limit
    const configPath = this.getConfig();
    const { base_url, username, password,stream_types,datalimit } = configPath;
    const seriesInfo = stream_types.series[2];
    const {limit_data,active} = datalimit;
    // Obtener todos los datos de la serie
    const response = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=get_series`);

    const seriesList = active ? response.data.slice(0, limit_data || 5) : response.data;

    const limit = pLimit(5); // Limitar a 5 solicitudes simultáneas

    // Mapear y llenar los datos de cada serie
    const filledSeriesData = Promise.all(seriesList.map(series => 
        limit(async () => {
            const dataSeries = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=${seriesInfo}&series_id=${series.series_id}`);
            const seriesData = this.getSeriesData(base_url, username, password, dataSeries.data,series.series_id);
            return seriesData;
        })
    ));


    const domain = this.extractDomain(base_url);
    // Guardar los datos en un archivo JSON
    //fs.writeFileSync(path.join(__dirname, `../../data/series/series_${domain}.json`), JSON.stringify(filledSeriesData, null, 2));

    return filledSeriesData;
}

async getStoredSeriesData() {
   /*
    const dataDir = path.join(__dirname, `../../data/series/series_${domain}.json`);
    const files = fs.readdirSync(dataDir);
    const seriesData = files.map(file => {
        const filePath = path.join(dataDir, file);
        const fileData = fs.readFileSync(filePath);
        return JSON.parse(fileData);
    });*/
     const configPath = this.getConfig();
    const { base_url} = configPath;
    const domain = this.extractDomain(base_url);
    const filePath = path.join(__dirname, `../../data/series/series_${domain}.json`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo series_${domain}.json no existe.`);
    }
    try {
        const fileData = fs.readFileSync(filePath);
        return JSON.parse(fileData);
    }
    catch (error) {
        throw new Error(error + ` Error al leer el archivo series_${domain}.json`);
    }
}

async groupEpisodesBySeason(seriesId) {
    const configPath = this.getConfig();
    const { base_url, username, password, stream_types } = configPath;
    const seriesInfo = stream_types.series[2]; // Obtener el valor de `get_series_info`
    const series = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=${seriesInfo}&series_id=${seriesId}`);
    const response = this.getSeriesData(base_url,username,password,series.data,seriesId);    ;
    return response;
}

async getPaginatedSeriesData(page = 1, limit = 10) {
    const storedSeriesData = await this.mapAndFillSeriesData();
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = storedSeriesData.slice(startIndex, endIndex);
    return paginatedData;
}

}
const instance = new M3UService();
Object.freeze(instance);

module.exports = instance;
