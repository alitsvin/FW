import BElang from '../Libs/BE.js'
import CodeToIcon from '../Libs/weatherCodeIcon.js';
import makeDrawIconMethod from '../func/drawWeaherIcons.js';

export default class DayForecast extends HTMLElement {
  constructor(index) {
    super();

    this.state = {
      datetime: null,
      weatherStatus: null,
      min_temp: null,
      max_temp: null,
      min_temp_f: null,
      max_temp_f: null,
      currentTempUnit: 'C',
      timezone: null,
      code: null,
      currentLang: 'RU',
    }

    this.settings = {
      dateFormat: {
        'EN': 'en-GB',
        'RU': 'ru-RU',
        'BE': 'be-BY',
      },
      iconId: null,
    }

    this.index = index;
    this.icon = null,
      this.isUpdateedArr = [];
  }

  render() {
    let minT = null;
    let maxT = null;

    const statusText = this.state.weatherStatus;

    const dateFormat = this.settings.dateFormat[this.state.currentLang];
    if (this.state.currentTempUnit == 'C') {
      minT = this.state.min_temp;
      maxT = this.state.max_temp;
    } else if (this.state.currentTempUnit == 'F') {
      minT = this.state.min_temp_f;
      maxT = this.state.max_temp_f;
    }

    const date = new Date(Date.parse(this.state.datetime) || Date.now());
    let dateObj = new Intl.DateTimeFormat(dateFormat, {
      month: "2-digit",
      day: 'numeric',
      weekday: 'long',
    }).format(date);

    if (this.state.currentLang == 'BE') {
      dateObj = BElang.days[dateObj.split(',')[0]] + ", " + dateObj.split(',')[1];
    }

    this.innerHTML =
      `<span slot='date'>${dateObj}</span>
      <span slot='statusText'>${statusText}</span>
      <canvas id='${this.settings.iconId}' slot='statusImg'></canvas>
      <span slot='minTemperature'> ${minT} </span>
    <span slot='maxTemperature'> ${maxT} ${this.state.currentTempUnit} </span>`

    this.icon.set(this.settings.iconId, CodeToIcon[this.state.code]);
    this.icon.play();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {width: 100%;  height: 100%; display: flex; justify-content: center; align-items:center;}
        div {width: 100%; min-height: 60px; display: flex; justify-content: center; align-items:center;}  
        #contentBlock { width: 80%; min-width: 200px; height: 70%; min-height:120px; display: flex; flex-direction: column;
           justify-content: space-around; align-items:center; font-size: 18px; border:1px solid white; border-radius: 10px;}
        #date {height:35%;}
        #weatherStatus {height:40%;}
        #statusText {max-width: 100%; height:100%; text-align: right;}
        #statusImg {max-width: 50%; height:100%}
        ::slotted(canvas){max-width:100%; max-height:100%}
        #temperature {height:35%;}

        @media screen and (max-width: 1024px) {
          div {font-size: 22px;}
          #statusText {font-size: 28px;}
          ::slotted(canvas){max-width:70%; max-height:100%}
        }
         
      </style>
      <div id='contentBlock'>
        <div id='date'>
          <slot name='date'></slot>
        </div>
        <div id='weatherStatus'>
          <div id='statusText'>
            <slot name='statusText'></slot>
          </div>
          <div id='statusImg'>
            <slot name='statusImg'></slot>
          </div>
        </div>
        <div id='temperature'>
          <span>
            <slot name='minTemperature'></slot> -  <slot name='maxTemperature'></slot> 
          </span>
        </div>
      </div>
    `

    this.index = document.querySelectorAll('day-forecast').length - 1;

    makeDrawIconMethod(this);
    this.icon = new this.Skycons({ "monochrome": false });
    this.settings.iconId = `forecastIcon${this.index}`
    this.icon.add(this.settings.iconId, 'c01d')

    for (let item in this.state) {
      this.setAttribute(item, this.state[item]);
    }
  }

  setState(propName, newPropState) {
    this.state[propName] = newPropState;
    this.setAttribute(propName, this.state[propName]);
  }

  static get observedAttributes() {
    return ['date', 'weatherstatus', 'mintemp_c', 'maxtemp_c', 'mintemp_f', 'maxtemp_f', 'currenttempunit', 'currentlang', 'timezone']
  }

  attributeChangedCallback() {
    this.isUpdateedArr.push(true);
    const updateIndex = this.isUpdateedArr.length - 1;
    setTimeout(() => {
      this.isUpdateedArr[updateIndex] = false;
      let isReadyToRender = false;
      const currentLength = this.isUpdateedArr.length;
      for (let i = 0; i < currentLength; i += 1) {
        if (this.isUpdateedArr[i]) {
          isReadyToRender = false;
          break;
        } else {
          isReadyToRender = true;
        }
      }
      if (isReadyToRender) {
        this.isUpdateedArr = [];
        this.render();
      }
    }, 16)

  }
}
