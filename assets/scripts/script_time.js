function updateTime() {
    var now = new Date();

    // Function to calculate the ISO week number
    function getISOWeekNumber(d) {
        var target = new Date(d.valueOf());
        var dayNr = (d.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        var firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / (7 * 24 * 60 * 60 * 1000));
    }

    var weekNumber = getISOWeekNumber(now);
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
