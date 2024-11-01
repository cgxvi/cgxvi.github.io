document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        updateURL();
    });
});

function updateURL() {
    const inputText = document.getElementById('userInput').value;
    const baseURL = 'https://doi-org.ezproxy.ub.gu.se/';
    const fullURL = baseURL + encodeURIComponent(inputText);
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `<a href="${fullURL}" target="_blank">${fullURL}</a>`;
}