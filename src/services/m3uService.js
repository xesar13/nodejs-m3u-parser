const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function parseM3U(url) {
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

async function parseIPTVUrl(type) {
    try {
        const configPath = getConfig();
        
        const { base_url, username, password, stream_types, stream_extensions, categories,menustart } = configPath;
        if (type === 'menu') {
            return {
                providerName: "Roku Developers",
                language: "en-US",
                lastUpdated: new Date().toISOString(),
                ...menustart
            };
        }
        const [streamAction, categoryAction] = stream_types[type];

        const responseCategories = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=${categoryAction}`);
        const categoriesData = responseCategories.data;

        const response = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=${streamAction}`);
        const data = response.data;

      //  const filteredData = data.filter(item => categoriesData.some(category => category.hasOwnProperty(item.category_id)));
        //const filteredData = data.filter(item => categoriesData.some(category => category.category_id === item.category_id));
        //const dataToUse = filteredData.length ? filteredData : data;

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
                tags: ['demo'],
                id: generateId(),
                shortDescription: 'Demonstrates the Roku automated channel testing software.',
                title: item.name,
                content: {
                    duration: 713,
                    videos: [{
                        videoType:  item.stream_type || 'm3u8',
                        url: `${base_url}/${type}/${username}/${password}/${item.stream_id}.${item.container_extension || 'm3u8'}`,
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

        return {
            providerName: "Roku Developers",
            language: "en-US",
            lastUpdated: new Date().toISOString(),
            ...categorizedData
        };
    } catch (error) {
        throw new Error('Error al obtener el archivo JSON: ' + error.message);
    }
}

function getUrls() {
    const filePath = path.join(__dirname, '../../urls.json');
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
}

function getConfig() {
    const filePath = path.join(__dirname, '../../config.json');
    if (!fs.existsSync(filePath)) {
        throw new Error('El archivo config.json no existe.');
    }
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
}


function generateId() {
    return Math.random().toString(36).substr(2, 16);
}

module.exports = {
    parseM3U,
    parseIPTVUrl,
    getUrls
};
