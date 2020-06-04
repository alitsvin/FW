const RUlang = {
  options: {
    apparentTemp: 'Ощущается как',
    wind: 'Ветер',
    humidity: 'Влажность',
    сurrentWindUnitText: 'м/c',
    clouds: 'Облачность',
    Latitude: 'Широта',
    Longitude: 'Долгота',
    searchError: `Мы не нашли этот город на нашей планете:(`,
    weatherError: 'Боги АПИ не позволяют узнать погоду здесь',
    C: 'по Цельсию',
    F: 'по Фаренгейту',
    windDirection: {
      S: 'Ю',
      W: 'З',
      N: 'С',
      E: 'В'
    }
  },
  weatherStatus: {
    'Clear': 'Ясно',
    'Partly cloudy': 'Частично облачно',
    'Heavy rain': 'Ливень',
    'Light rain shower': 'Небольшой дождь',
  },
  speechOptions: {
    'currentWeatherTemplate': function (city, status, temp, tempUnit, wind, humidity) {
      return `Сегодня в ${city} ${status}
    Температура воздуха ${temp} ${tempUnit}
    Скорость ветра ${wind} метров в секунду
    Влажность около ${humidity} процентов`
    },
    louder: 'Стало громче',
    lower: 'Стало тише',
    'forecastTemplate': function (day, status, minTemp, maxTemp) {
      return `В ${day} ${status}
      температура от ${minTemp} до ${maxTemp}
      `
    }
  }


}

export default RUlang;