const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'

export const proxyUrl = (url) => {
    return CORS_PROXY + url
} 