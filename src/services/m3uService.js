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
                    logo: 'pkg:/images/icon_focus_hd.png'
                };
                attributes.forEach(attr => {
                    if (attr.startsWith('tvg-logo=')) {
                        currentItem.logo = attr.split('=')[1].replace(/"/g, '');
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
        
        const { base_url, username, password, stream_types, stream_extensions, categories } = configPath;

        const response = await axios.get(`${base_url}/player_api.php?username=${username}&password=${password}&action=get_live_streams`);
        const data = response.data;

        const filteredData = data.filter(item => categories.hasOwnProperty(item.category_id));
        const dataToUse = filteredData.length ? filteredData : data;

        const parsedData = dataToUse.map(item => {
            const extension = stream_extensions[item.stream_type] || 'm3u8';
            return {
                longDescription: 'Learn how streaming works on the Roku platform. This video explains how content is delivered from a content delivery network (CDN) to a Roku device via a content feed',
                thumbnail: item.stream_icon || 'http://odenfull.co:2086/images/Kanmk96vTt-hjZj_mC4RcPttLMlmeeoOsTOSXqs4fWXm360tfVL4n72DiGcqnmJjEaLTx-pqpiKPRnq3r3oG1F5G-Ai9TBV7jxWp9OYRkVlvuPHnkAR6-rHFFEGQmOzy8SvYYtEdrb61VYjE1tzklg.png',
                releaseDate: '2020-01-15',
                genres: categories[item.category_id] || 'Unknown',
                tags: 'getting-started',
                id: item.stream_id,
                shortDescription: 'Learn how streaming works on the Roku platform. This video explains how content is delivered from a content delivery network (CDN) to a Roku device via a content feed',
                title: item.name,
                videoType: stream_types[item.stream_type] || 'Unknown',
                url: `${base_url}/${type}/${username}/${password}/${item.stream_id}.${extension}`,
                quality: 'HD'
            };
        });

        return parsedData;
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
