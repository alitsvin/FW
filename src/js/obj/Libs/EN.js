const ENlang = {
  options: {
    apparentTemp: 'Apparent temperature',
    wind: 'Wind',
    humidity: 'Humidity',
    сurrentWindUnitText: 'mps',
    clouds: 'Cloud coverage',
    Latitude: 'Latitude',
    Longitude: 'Longitude',
    searchError: `We did not find this city on our planet:(`,
    weatherError: `IPA gods do not let you know the weather here`,
    C: 'Celsius',
    F: 'Fahrenheit',
    windDirection: {
      S: 'S',
      W: 'W',
      N: 'N',
      E: 'E'
    }

  },
  weatherStatus: {
    Clear: 'Clear',
    'Partly cloudy': 'Partly cloudy',
    'Heavy rain': 'Heavy rain',
    'Light rain shower': 'Light rain shower',
  },
  speechOptions: {
    'currentWeatherTemplate': function (city, status, temp, tempUnit, wind, humidity) {
      return `Today in the ${city} ${status}
    Air temperature ${temp} ${tempUnit}
    Wind speed ${wind} meters per second
    Humidity is about ${humidity} percent`
    },
    louder: 'Louder',
    lower: 'Lower',
    'forecastTemplate': function (day, status, minTemp, maxTemp) {
      return `${day} ${status}
      temperature from ${minTemp} to ${maxTemp}
      `
    }
  }


}

export default ENlang;