// returns the current date
function today (format = 'dd.mm.yyyy') {
    const timeElapsed = Date.now(),
          dtDate = new Date(timeElapsed);
    return format$(dtDate,format);
}

function format$ (expression, format = 'dd.mm.yyyy') {
    let d = new Date(expression),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = d.getHours(),
        min = d.getMinutes(),
        sec = d.getSeconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;  
    if (hours.length < 2) hours = '0' + hours;  
    if (min.length < 2) min = '0' + min;  
    if (sec.length < 2) sec = '0' + sec;  

    if (format.includes(':')) {
        return format.replace('hh',hours).replace('nn', min).replace('ss', sec);
    }
    return format.replace('mm',month).replace('yyyy', year).replace('dd', day);
}

function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}