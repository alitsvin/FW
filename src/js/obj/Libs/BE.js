const BElang = {
  options: {
    apparentTemp: 'Адчуваецца як',
    wind: 'Вецер',
    humidity: 'Вільготнасць',
    сurrentWindUnitText: 'м/с',
    clouds: 'Воблачнасць',
    Latitude: 'Шырата',
    Longitude: 'Даўгата',
    searchError: `Мы не знайшлі гэты горад на нашай планеце:(`,
    weatherError: `Багі АПІ не дазваляюць даведацца надвор'е тут`,
    C: 'па Цэльсіі',
    F: 'па Фарэнгейце',
    windDirection: {
      S: 'Ю',
      W: 'З',
      N: 'С',
      E: 'В'
    }
  },
  days: {
    Monday: `Панядзелак`,
    Tuesday: `Aўторак`,
    Wednesday: `Cерада`,
    Thursday: `Чацьвер`,
    Friday: `Пятніца`,
    Saturday: `Субота`,
    Sunday: `Нядзеля`,
    'понедельник': `Панядзелак`,
    'вторник': `Aўторак`,
    'среда': 'Cерада',
    'четверг': `Чацьвер`,
    'пятница': `Пятніца`,
    'суббота': `Субота`,
    'воскресенье': `Нядзеля`,
  },
  speechOptions: {
    'currentWeatherTemplate': function (city, status, temp, tempUnit, wind, humidity) {
      return `Сёння у Горадзе ${city} ${status}
      Тэмпература ${temp} ${tempUnit}
      Хуткасць ветру  ${wind} метрау у секунду
      Вильготнасць каля ${humidity} адсоткау`
    },
    louder: 'Стало громче',
    lower: 'Стало тише',
    'forecastTemplate': function (day, status, minTemp, maxTemp) {
      return `У ${day} ${status}
      тэмпература ад ${minTemp} да ${maxTemp}
      `
    }
  }

}

export default BElang;