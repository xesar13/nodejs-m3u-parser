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
                    title: info[1] || '',
                    logo: 'pkg:/images/icon_focus_hd.png'
                };
                attributes.forEach(attr => {
                    if (attr.startsWith('tvg-logo=')) {
                        currentItem.logo = attr.split('=')[1].replace(/"/g, '');
                    }
                });
            } else if (line && !line.startsWith('#')) {
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

function getUrls() {
    const filePath = path.join(__dirname, '../../urls.json');
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
}

module.exports = {
    parseM3U,
    getUrls
};

function generateId() {
    return Math.random().toString(36).substr(2, 16);
}