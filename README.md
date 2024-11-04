# nodejs-m3u-parser

Este proyecto es una API en Node.js que permite analizar archivos M3U y devolver la información en un formato JSON específico. La API recibe un JSON con la URL del archivo M3U y devuelve una lista de elementos con detalles como el nombre del proveedor, la descripción, la URL del video, entre otros.

## Estructura del Proyecto

```
nodejs-m3u-parser
├── src
│   ├── controllers
│   │   └── m3uController.js
│   ├── routes
│   │   └── m3uRoutes.js
│   ├── services
│   │   └── m3uService.js
│   ├── app.js
│   └── server.js
├── package.json
└── README.md
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Navega al directorio del proyecto:
   ```
   cd nodejs-m3u-parser
   ```

3. Instala las dependencias:
   ```
   npm install
   ```

## Uso

1. Inicia el servidor:
   ```
   npm start
   ```

2. Realiza una solicitud POST al endpoint `/api/m3u` con el siguiente formato:
   ```json
   {
       "url": "URL_DEL_ARCHIVO_M3U"
   }
   ```

3. La respuesta será un JSON con la estructura especificada, que incluye detalles sobre los elementos del archivo M3U.

## Ejemplo de Respuesta

```json
{
    "providerName": "Roku Developers",
    "language": "en-US",
    "lastUpdated": "2024-11-01T19:46:45.390384",
    "listm3u8": [
        {
            "longDescription": "Descripción larga del video.",
            "thumbnail": "URL_DE_LA_IMAGEN",
            "releaseDate": "2020-01-15",
            "genres": "educational",
            "tags": "getting-started",
            "id": "ID_UNICO",
            "shortDescription": "Descripción corta del video.",
            "title": "Título del video",
            "videoType": "HLS",
            "url": "URL_DEL_VIDEO",
            "quality": "HD"
        }
    ]
}
```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.