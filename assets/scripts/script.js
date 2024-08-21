function updateURL() {
    const inputText = document.getElementById('userInput').value;
    const baseURL = 'https://doi-org.ezproxy.ub.gu.se/';
    const fullURL = baseURL + encodeURIComponent(inputText);
    document.getElementById('result').innerText = fullURL;
}