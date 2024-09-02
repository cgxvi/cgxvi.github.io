function updateTime() {
    var now = new Date();
    
    // Function to calculate the week number
    function getWeekNumber(d) {
        var oneJan = new Date(d.getFullYear(), 0, 1);
        var numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
        return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
    }

    var weekNumber = getWeekNumber(now);
    var formattedTime = 'Week ' + weekNumber + ' - ' +
                        now.getFullYear() + '-' +
                        ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + now.getDate()).slice(-2) + ' - ' +
                        ('0' + now.getHours()).slice(-2) + ':' +
                        ('0' + now.getMinutes()).slice(-2) + ':' +
                        ('0' + now.getSeconds()).slice(-2);
    document.getElementById('datetime').textContent = formattedTime;
}

setInterval(updateTime, 1000);
updateTime(); // initial call to display time immediately
