import Clock from './otherComponents/clock.js';
import DayForecast from './otherComponents/forecastDay.js';
import Weather from './func/getWeather.js';
import translateIt from './func/translateIt.js';
import makeDrawIconMethod from './func/drawWeaherIcons.js';

import ENlang from './Libs/EN.js';
import RUlang from './Libs/RU.js';
import BElang from './Libs/BE.js';
import CodeToIcon from './Libs/weatherCodeIcon.js';

customElements.define('time-formatted', Clock);
customElements.define('day-forecast', DayForecast);

export default class WeatherToday extends HTMLElement {
  constructor() {
    super();

    this.state = {
      currentCity: 'Minsk',
      currentCountry: 'Belarus',
      currentLang: 'EN',
      currentTempUnit: 'C',
      сurrentWindUnit: 'mps',
      timezone: null,
    }

    this.localState = {
      prevLang: this.state.currentLang,
      isReadyToWork: false,
    }

    this.weatherOptions = {
      wind: 'Wind',
      humidity: 'Humidity',
      clouds: 'Cloud coverage',
    }

    this.settings = {
      forecastDaysCount: 3,
    }

    this.langLib = {
      'RU': RUlang,
      'EN': ENlang,
      'BE': BElang,
    }

    this.voicesLib = {
      'RU': 0,
      'EN': 1,
      'BE': 0,
    }

    this.dependentObj = {
      currentWeatherIcon: null,
      forecastDays: [],
    }

    this.isReadyToRenderArr = [];

    this.weather = new Weather(this.settings.forecastDaysCount);
  }

  async promiseWaiting(prom) {
    return await prom;
  }

  initDOM() {
    this.innerHTML =
      `<span slot='currentCity' ></span>
      <span slot='currentCountry' ></span>
      <time-formatted slot='currentTime' hour="numeric" minute="numeric" second="numeric" weekday='long' month='2-digit' day='2-digit' year='2-digit'></time-formatted>
      <span slot='statusText' ></span>
      <canvas id="icon1" slot='statusImg'></canvas>
      <span slot='currentTemperature'></span>
      <span slot='temperatureUnit'></span>
      <span slot='currentDescription' ></span>
      <span slot='currentDescription' ></span>
      <span slot='currentDescription' ></span>`

    this.currentTime = this.querySelector('time-formatted');
    setInterval(() => { this.currentTime.setAttribute('dateTime', new Date()) }, 1000)

    makeDrawIconMethod(this);
    this.dependentObj.currentWeatherIcon = new this.Skycons({ "monochrome": false });
    this.dependentObj.currentWeatherIcon.add("icon1", this.Skycons.PARTLY_CLOUDY_DAY);
    this.dependentObj.currentWeatherIcon.play();

    for (let i = 0; i < this.settings.forecastDaysCount; i += 1) {
      this.insertAdjacentHTML('beforeend', `
    <day-forecast slot='dayForecast'></day-forecast>
    `)
    }

    this.dependentObj.forecastDays = this.querySelectorAll('day-forecast');
  }

  initEventListeners() {
    this.msg = new SpeechSynthesisUtterance();
    this.msg.pitch = 1;
    this.msg.rate = 1;
    this.msg.volume = 1;
  }

  readWeather(mode) {
    this.msg.voice = speechSynthesis.getVoices()[this.voicesLib[this.state.currentLang]];
    this.msg.lang = this.state.currentLang.toLowerCase();
    const lib = this.langLib[this.state.currentLang];
    switch (mode) {
      case 'weatherToday':
        const city = this.querySelector('span[slot=currentCity]').innerHTML;
        const state = this.weather.currentWeather.status;
        const temp = (this.state.currentTempUnit == 'C') ? this.weather.currentWeather.temp : this.weather.currentWeather.temp_f;
        const tempUnit = lib.options[this.state.currentTempUnit];
        const wind = Math.floor(this.weather.currentWeather.wind_spd * 10) / 10;
        const humidity = this.weather.currentWeather.rh;
        const fff = lib.speechOptions.currentWeatherTemplate;
        this.msg.text = fff(city, state, temp, tempUnit, wind, humidity);
        speechSynthesis.speak(this.msg);
        break;
      case 'forecast':
        this.msg.text = '';
        this.dependentObj.forecastDays.forEach((element) => {
          let day = element.querySelector('span[slot=date]').innerHTML;
          day = day.split(',')[0];
          const fff = lib.speechOptions.forecastTemplate;
          console.log(f);
          const status = element.state.weatherStatus;
          const minTemp = (this.state.currentTempUnit == 'C') ? Math.round(element.state.min_temp) : Math.round(element.state.min_temp_f);
          const maxTemp = (this.state.currentTempUnit == 'C') ? Math.round(element.state.max_temp) : Math.round(element.state.max_temp_f);
          this.msg.text += lib.speechOptions.fff(day, status, minTemp, maxTemp);
        })

        speechSynthesis.speak(this.msg);
        break;

      case 'louder':
        this.msg.text = lib.speechOptions.louder;
        this.msg.volume += 0.3;
        speechSynthesis.speak(this.msg);
        break;
      case 'lower':
        this.msg.text = lib.speechOptions.louder;
        this.msg.volume -= 0.3;
        speechSynthesis.speak(this.msg);
        break;
    }
  }

  async tryToWeatherIt(city, country) {
    const searchCity = await translateIt(city, 'en');
    const searchCountry = await translateIt(country, 'en');

    this.weatherPromise = this.weather.getWeather(searchCity, searchCountry);
    const res = await this.weatherPromise;
    if (res == undefined) {
      return false;
    }
    this.state.currentCity = city;
    this.state.currentCountry = country;
    this.render(false);
    return true;
  }


  render(isUpdateWeather) {

    let temperature = null;
    let city = null;
    let country = null;
    if (isUpdateWeather || this.weatherPromise == null) {
      this.weatherPromise = this.weather.getWeather();
    }
    this.weatherPromise.then(() => {
      //Translation
      if (this.state.currentLang != this.localState.prevLang) {
        city = translateIt(this.state.currentCity, this.state.currentLang);
        country = translateIt(this.state.currentCountry, this.state.currentLang);
      } else {
        city = this.state.currentCity;
        country = this.state.currentCountry;
      }
      const lib = this.langLib[this.state.currentLang];
      for (let item in this.weatherOptions) {
        this.weatherOptions[item] = this.langLib[this.state.currentLang].options[item];
      }

      //Temperature
      if (this.state.currentTempUnit == 'C') {
        temperature = this.weather.currentWeather.temp;
      } else if (this.state.currentTempUnit == 'F') {
        temperature = this.weather.currentWeather.temp_f;
      }

      //Icon
      this.dependentObj.currentWeatherIcon.set('icon1', CodeToIcon[this.weather.currentWeather.code])

      //DOMrendering
      Promise.all([city, country]).then((res) => {
        city = res[0][0][0].toUpperCase() + res[0].slice(1);
        country = res[1][0][0].toUpperCase() + res[1].slice(1);
        const currentStatusText = this.weather.currentWeather.status;
        const windSpeedText = lib.options.сurrentWindUnitText;
        const windDerictionText = this.weather.currentWeather.wind_cdir;

        this.querySelector('[slot=currentCity]').innerHTML = `${city}`;
        this.querySelector('[slot=currentCountry]').innerHTML = `${country}`;
        this.querySelector('[slot=statusText]').innerHTML = `${currentStatusText}`;
        this.querySelector('[slot=currentTemperature').innerHTML = `${temperature}`;
        this.querySelector('[slot=temperatureUnit').innerHTML = `${this.state.currentTempUnit}`;
        this.querySelectorAll('[slot=currentDescription]')[0].innerHTML =
          `${this.weatherOptions.wind}: ${Math.round(this.weather.currentWeather.wind_spd * 100) / 100} ${windSpeedText}, ${windDerictionText}`;
        this.querySelectorAll('[slot=currentDescription]')[1].innerHTML = `${this.weatherOptions.humidity}: ${this.weather.currentWeather.rh}%`;
        this.querySelectorAll('[slot=currentDescription]')[2].innerHTML = `${this.weatherOptions.clouds}: ${this.weather.currentWeather.clouds}%`;
      })

      for (let i = 0; i < this.dependentObj.forecastDays.length; i += 1) {
        for (let item in this.dependentObj.forecastDays[i].state) {
          if (item == 'weatherStatus') {
            this.dependentObj.forecastDays[i].setState(item, this.weather.forecastDaysArr[i]['status'])
          } else if (item == 'currentTempUnit') {
            this.dependentObj.forecastDays[i].setState(item, this.state.currentTempUnit);
          } else if (item == 'currentLang') {
            this.dependentObj.forecastDays[i].setState(item, this.state.currentLang);
          } else {
            this.dependentObj.forecastDays[i].setState(item, this.weather.forecastDaysArr[i][item])
          }
        }
      }
    })
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
    <style>
      div {display: flex; flex-direction: row; align-items: center; color:white;}
      #userInfo {width: 100%; flex-direction: column; justify-content: center; text-align: center; }
      #currentWeather {height:50%; flex-direction: column; justify-content: center;}
      #weatherStatus {width: 100%; min-height: 150px; justify-content: center; font-size: 40px}
      #statusText {max- width: 60%; height: 100%; z-index:31;justify-content: center; text-align:center; }
      #statusImg {width: 40%; max-width:200px; height: 100%; z-index:31; justify-content: flex-start;}
      
      #weatherDescription {width:100%; justify-content: space-around; }
      #currentTemperature {height: 100%; display: flex; justify-content: center; align-items: center; font-size: 150px;}
      #temperatureUnit {width:20%; height:20%; position: relative; bottom: 10%; font-size: 80px; }
      #currentDescription {height:100%; display:flex; flex-direction: column; justify-content: center; align-items: flex-start; word-spacing: 3px;}
      #forecast {width: 100%; height: 30%; justify-content: center; text-align:center;}
      
      @media screen and (max-width: 1024px) {
        #userInfo { min-height: 100px;}
        #weatherStatus { height: auto; min-height: 200px;}
        #weatherDescription { height: auto; min-height: 200px;}
        #forecast { height: auto; min-height: 400px; flex-direction: column; justify-content: space-around;}
        #forecast ::slotted(day-forecast) {margin: 20px}
      }

      @media screen and (max-width: 500px) {
        #weatherDescription {min-height: 300px; flex-direction: column; justify-content: flex-start;}
        #statusImg ::slotted(canvas) {max-width:100%; max-height:100%;}
      }

    </style>
    
    <div id='userInfo'>
      <div id='city'>
        <slot name='currentCity'></slot>
      </div>
      <div id='country'>
        <slot name='currentCountry'></slot>
      </div>
      <div id='time'>
        <slot name='currentTime'></slot>
      </div>
    </div>
    
    <div id='currentWeather'>
    <div id='weatherStatus'>
      <div id='statusText'>
        <slot name='statusText'></slot>
      </div>
      <div id='statusImg'>
        <slot name='statusImg'></slot>
      </div>
    </div>
    
    <div id='weatherDescription'>
      <div id='currentTemperature'>
        <slot name='currentTemperature'></slot>
        <div id='temperatureUnit'>
          <slot name='temperatureUnit'></slot>
        </div>
      </div>
      <div id='currentDescription'>
        <slot name='currentDescription'></slot>
      </div>
    </div>
    </div>

    <div id='forecast'>
      <slot name='dayForecast'></slot>
    </div>`;

    this.initDOM();
    this.initEventListeners();

    for (let item in this.state) {
      this.setAttribute(item, this.state[item])
    }

    this.localState.isReadyToWork = true;

  }

  setState(propName, newPropState) {
    if (this.state[propName] != newPropState) {
      if (propName == 'currentLang') {
        this.localState.prevLang = this.state.currentLang;
      }

      this.state[propName] = newPropState;
      this.setAttribute(propName, this.state[propName]);

      //CurrentTime
      if (propName == 'currentLang') {
        this.currentTime.setState('currentDateFormat', this.state.currentLang)
      }
      if (propName == 'timezone') {

        this.currentTime.setState('timezone', this.state.timezone)
      }

      //WeatherGetter
      if (this.weather.state.hasOwnProperty(propName)) {
        this.weather.setState(propName, newPropState);
      }
    }
  }

  static get observedAttributes() {
    return ['currentlang', 'currentcity', 'currenttempunit', 'currentwindunit', 'timezone']
  }

  attributeChangedCallback(name) {
    if (this.localState.isReadyToWork) {
      this.isReadyToRenderArr.push(false);
      const updateIndex = this.isReadyToRenderArr.length - 1;
      setTimeout(() => {

        this.isReadyToRenderArr[updateIndex] = true;
        let isReadyToRender = false;
        const currentLength = this.isReadyToRenderArr.length;
        for (let i = 0; i < currentLength; i += 1) {
          if (this.isReadyToRenderArr[i]) {
            isReadyToRender = true;
          } else {
            isReadyToRender = false;
            break;
          }
        }
        if (isReadyToRender) {
          this.isReadyToRenderArr = [];
          if (name == 'currentlang') {
            this.render(true);
          } else {
            this.render(false);
          }
        }
      }, 16)
    }

  }

}