function updateTime() {
    var now = new Date();
    var formattedTime = now.getFullYear() + '-' +
                        ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + now.getDate()).slice(-2) + ' ' +
                        ('0' + now.getHours()).slice(-2) + ':' +
                        ('0' + now.getMinutes()).slice(-2) + ':' +
                        ('0' + now.getSeconds()).slice(-2);
    document.getElementById('datetime').textContent = formattedTime;
  }

setInterval(updateTime, 1000);
updateTime(); // initial call to display time immediately