class Episode {
    constructor(id, title, episodeNumber, content, thumbnail, shortDescription, releaseDate, longDescription, tags, genres, count) {
        this.id = id;
        this.title = title;
        this.episodeNumber = episodeNumber;
        this.content = content;
        this.thumbnail = thumbnail;
        this.shortDescription = shortDescription;
        this.releaseDate = releaseDate;
        this.longDescription = longDescription;
        this.tags = tags;
        this.genres = genres;
        this.count = count;
    }
}

class Season {
    constructor(title, episodes) {
        this.title = title;
        this.episodes = episodes;
    }
}

class Series {
    constructor(id, title, releaseDate, shortDescription, thumbnail, genres, tags, seasons) {
        this.id = id;
        this.title = title;
        this.releaseDate = releaseDate;
        this.shortDescription = shortDescription;
        this.thumbnail = thumbnail;
        this.genres = genres;
        this.tags = tags;
        this.seasons = seasons;
    }
}

module.exports = {
    Episode,
    Season,
    Series
};