import convertStrToUrL from '../func/covertStrToUrl.js'

export default class Weather {
  constructor(forecastDaysCount) {
    this.state = {
      currentCity: 'Minsk',
      currentCountry: 'Belarus',
      forecastDaysCount: forecastDaysCount,
      currentLang: 'EN',
      currentUnit: 'C',
    }

    this.setting = {
      weatheLang: {
        'EN': 'en',
        'RU': 'ru',
        'BE': 'be'
      },
      unitsTeg: {
        'C': 'M',
        'F': 'I',
      }
    }

    this.currentWeather = {
      'temp': null,
      'temp_f': null,
      'status': null,
      "wind_spd": null,
      'wind_cdir': null,
      'pres': null,
      'rh': null,
      'clouds': null,
      "app_temp": null,
      "app_temp_f": null,
      'code': null,
    }

    this.forecastDaysArr = [];

    this.convertStrToUrL = convertStrToUrL;
  }

  async getWeather(searchCity = this.state.currentCity, searchCountry = this.state.currentCountry) {
    let forecastDay = {
      'datetime': null,
      "max_temp": null,
      "max_temp_f": null,
      "min_temp": null,
      "min_temp_f": null,
      "status": null,
      'code': null,
    }

    const apiKey = `6318b4cd5e7e429085cdfcc30c1f6b55`;
    let city = this.convertStrToUrL(searchCity);
    let country = `&country=` + this.convertStrToUrL(searchCountry);
    if (country.includes('+')) { country = '' };
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}${country}&days=${this.state.forecastDaysCount + 1}&units=${this.setting.unitsTeg[this.state.currentUnit]}&lang=${this.setting.weatheLang[this.state.currentLang]}&key=${apiKey}`;
    const data = await fetch(url).then((res) => {
      if (res.statusText == 'OK') {
        return res.json()
      } else { return false }
    });

    if (data) {
      for (let item in this.currentWeather) {
        if (item == 'status') {
          this.currentWeather[item] = data.data[0].weather.description;
        } else if (item == 'code') {
          this.currentWeather[item] = data.data[0].weather.icon;
        } else {
          this.currentWeather[item] = data.data[0][item];
        }
      }
      this.currentWeather['temp_f'] = Math.round(((this.currentWeather['temp'] * 9 / 5) + 32) * 10) / 10;
      data.data.forEach((element, index) => {
        this.forecastDaysArr.push(Object.assign({}, forecastDay));
        for (let item in this.forecastDaysArr[index]) {
          if (item == 'status') {
            this.forecastDaysArr[index][item] = element.weather.description;
          } else if (item == 'code') {
            this.forecastDaysArr[index][item] = element.weather.icon;
          } else {
            this.forecastDaysArr[index][item] = element[item];
          }
        }
        this.forecastDaysArr[index]['max_temp_f'] = Math.round(((this.forecastDaysArr[index]['max_temp'] * 9 / 5) + 32) * 10) / 10;
        this.forecastDaysArr[index]['min_temp_f'] = Math.round(((this.forecastDaysArr[index]['min_temp'] * 9 / 5) + 32) * 10) / 10;
      })
      this.forecastDaysArr.shift();
      return data;
    }

  }

  setState(propName, newPropState) {
    this.state[propName] = newPropState;
  }
}