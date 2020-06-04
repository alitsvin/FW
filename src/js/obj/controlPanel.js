import state from '../state/state.js';

import CodeSpray from './Libs/speechCodeSpray.js';
import ENlang from './Libs/EN.js';
import RUlang from './Libs/RU.js';
import BElang from './Libs/BE.js';

export default class ControlPanel extends HTMLElement {
  constructor() {
    super();

    this.state = {
      currentCity: 'Minsk',
      currentCountry: 'Belarus',
      isSliderOn: true,
      currentLang: 'EN',
      currentTempUnit: 'C',
      timezone: null,
    }

    this.localState = {
      isReadyToWork: false,
      prevCity: null,
    }

    this.settings = {
      langArr: ['EN', 'RU', 'BE'],
      unitArr: ['C', 'F'],
    }

    this.langLib = {
      'RU': RUlang,
      'EN': ENlang,
      'BE': BElang,
    }

    this.isReadyToRenderArr = [];

  }

  async getGeo(city) {

    const APIkey = `cc46f0ecad424b97b7dda578ec07ca9d `;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&language=en&key=${APIkey}`;
    return await fetch(url).then(res => res.json(), () => this.errorMessage());
  }

  switchActiveButton(target, targetArr, targetObjArr) {
    if (target === this.state.currentLang) {
      this.langButtonArr.forEach((element) => {
        element.classList.remove('active');
      })
      const index = this.settings.langArr.indexOf(target) || 0;
      this.langButtonArr[index].classList.add('active');
    }
    if (target === this.state.currentTempUnit) {
      this.unitButtonArr.forEach((element) => {
        element.classList.remove('active');
      })
      const index = this.settings.unitArr.indexOf(target) || 0;
      this.unitButtonArr[index].classList.add('active');
    }

  }

  render(item) {

    this.switchActiveButton(this.state.currentLang, this.settings.langArr, this.langButtonArr);
    this.switchActiveButton(this.state.currentTempUnit, this.settings.unitArr, this.unitButtonArr);
    if (item == 'isslideron') {
      if (this.state.isSliderOn) {
        this.sliderButton.classList.add('active');
      } else { this.sliderButton.classList.remove('active') }
    }

  }

  searchSubmit(searchCity) {
    this.searchPromise.then((res) => {
      if (res.results.length > 0) {
        const city = searchCity;
        const country = res.results[0].components.country;
        const location = `${res.results[0].geometry.lat}, ${res.results[0].geometry.lng} `;
        const timezone = res.results[0].annotations.timezone.name;

        this.setState('currentCity', city);
        this.setState('currentCountry', country);
        this.setState('currentLocation', location);
        this.setState('timezone', timezone)
        state.getState('currentCity', city);
        state.getState('currentCountry', country);
        state.getState('currentLocation', location);
        state.getState('timezone', timezone)
        this.inputBlock.value = "";
      }
    })
  }

  tryToSearchIt(searchValue) {
    //this.searchPromise = this.getGeo(this.inputBlock.value);
    this.searchPromise = this.getGeo(searchValue);
    this.searchPromise.then((res) => {

      if (res.results.length > 0) {
        const city = searchValue;
        const country = res.results[0].components.country;
        //const location = `${res.results[0].geometry.lat}, ${res.results[0].geometry.lng} `;

        document.querySelector('weather-today').tryToWeatherIt(city, country).then((isGetWeather) => {
          if (isGetWeather) {
            this.searchSubmit(city);
          } else {
            this.errorMessage('weatherError');
          }
        });

      } else {
        this.errorMessage('searchError');
      }
    },
      () => this.errorMessage('searchError'));
  }



  errorMessage(err) {
    const lib = this.langLib[this.state.currentLang];
    this.inputBlock.setCustomValidity(lib.options[err])
    this.inputBlock.reportValidity();
  }


  initDOM() {
    this.insertAdjacentHTML('afterbegin', `<div class='infoButton' slot='infoButton'>i</div>`);
    this.insertAdjacentHTML('afterbegin', `<div class='sliderButton' slot='sliderSwitch'></div>`);
    this.settings.langArr.forEach((element) => {
      this.insertAdjacentHTML('beforeend', `<div id='${element}lang'class='langButton' slot='language'>${element}</div>`)
    })
    this.querySelector('div#ENlang').classList.add('active');
    this.settings.unitArr.forEach((element) => {
      this.insertAdjacentHTML('beforeend', `<div id='${element}unit' class='unitButton' slot='unit'>${element}</div>`)
    })
    this.querySelector('div#Cunit').classList.add('active');
    this.insertAdjacentHTML('beforeend',
      `<input id='search' slot='searchInput' placeholder='City' required>
      <div class='searchButton' slot='searchButton'></div>
      <div class='speakWeatherButton' slot='speakWeatherButton'></div>
      <div class='speechButton' slot='speechButton'></div>
    `);

    this.infoButton = this.querySelector('.infoButton');
    this.sliderButton = this.querySelector('.sliderButton');
    this.langButtonArr = this.querySelectorAll('.langButton');
    this.unitButtonArr = this.querySelectorAll('.unitButton');
    this.form = this.shadowRoot.querySelector('form');
    this.inputBlock = this.querySelector('input');
    this.searchButton = this.querySelector('div.searchButton');
    this.speechButton = this.querySelector('div.speechButton');
    this.weatherButton = this.querySelector('div.speakWeatherButton');

    this.sliderButton.insertAdjacentHTML('afterbegin', `<img src='assets/img/sliderIcon.png' width='24px' height='24px'>`)
    this.weatherButton.insertAdjacentHTML('afterbegin', `<img src='assets/img/weatherIcon.png' width='24px' height='24px'>`)
    this.searchButton.insertAdjacentHTML('afterbegin', `<img src='assets/img/searchIcon.png'>`);
    this.speechButton.insertAdjacentHTML('afterbegin', `<img src='assets/img/microIcon.png'>`)

    for (let item in this.state) {
      this.setAttribute(item, this.state[item])
    }
    this.localState.isReadyToWork = true;


  }

  initEventListeners() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.form.onsubmit = this.tryToSearchIt;
    this.addEventListener('click', () => {
      let item = null;
      if (event.target.closest('div.searchButton') != null) {
        item = event.target.closest('div.searchButton');
      } else if (event.target.closest('div.speechButton') != null) {
        item = event.target.closest('div.speechButton');
      } else if (event.target.closest('div.speakWeatherButton') != null) {
        item = event.target.closest('div.speakWeatherButton');
      } else if (event.target.closest('div.sliderButton') != null) {
        item = event.target.closest('div.sliderButton');
      } else if (event.target.closest('div.infoButton') != null) {
        item = event.target.closest('div.infoButton');
      }
      if (item != null) {
        switch (item.classList[0]) {
          case 'searchButton':
            this.tryToSearchIt(this.inputBlock.value);
            break;
          case 'speechButton':
            this.speechButton.classList.add('active');
            this.recognition.start();
            break;
          case 'speakWeatherButton':
            document.querySelector('weather-today').readWeather('weatherToday');
            break;
          case 'sliderButton':
            document.querySelector('background-slider').uploadNewSlide();
            break;
          case 'infoButton':
            this.infoButton.classList.toggle('active');
            document.querySelector('info-block').classList.add('switched');
            document.querySelector('info-block').classList.toggle('active');
            setTimeout(() => {
              document.querySelector('info-block').classList.remove('switched');
            }, 1000);
            break;
        }
      }
    })
    this.addEventListener('keydown', () => {
      if (event.key == "Enter") {
        this.tryToSearchIt(this.inputBlock.value);
      }
    })
    this.recognition.addEventListener('result', (res) => {

      let isCodeSpray = false;
      this.speechButton.classList.remove('active');
      const text = res.results[0][0].transcript;
      for (let item in CodeSpray) {
        if (text.includes(item)) {
          this.recognition.stop();
          isCodeSpray = true;
          document.querySelector('weather-today').readWeather(CodeSpray[item]);
          break;
        }
      }
      if (!isCodeSpray) {
        this.tryToSearchIt(text);
      }
    })
    this.recognition.addEventListener('error', (res) => {
      this.errorMessage('searchError');
    })

  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
    <style>
      div {height: 100%; display: flex; flex-direction: row; align-items: center;}
      #switchBlock {width: 60%; max-width: 900px; justify-content: center; font-size: 18px; color: white;}
      #switchBlock div {margin: 15px; display: flex; flex-direction: row; justify-content: flex-end; align-items: center;}
      #switchBlock ::slotted(div) {width: 30px; height: 30px; text-align:center; line-height:30px; border:1px solid white; border-radius: 5px 0 0 5px;}
      #searchBlock {height: 100%; width: 40%; max-width: 500px; display: flex; flex-direction: row; justify-content: center; align-items: center; }    
      form {width: 80%;  min-height: 30px; height: 60%; border: 1px solid white; border-radius: 10px; display: flex; flex-direction: row; justify-content: center; align-items: center; }
      #searchBlock ::slotted(input) {width: 80%; min-height: 30px; background-color: #ffffff00; border:none; font-size: 17px; color: white;}
      #searchBlock ::slotted(input:focus) {outline: none;}
      #searchBlock ::slotted(div) {width: 30px; min-height: 30px; height:30px; display: flex; align-items: center; justify-content: center; background-color: #ffffff00; }
      ::slotted(div.active) {background-color: rgb(41, 120, 165);}
      ::slotted(div.sliderButton:hover){background-color:#ffffff00}
      ::slotted(div:hover) {cursor: pointer; background-color: rgba(0, 162, 255, 0.921);}

      @media screen and (max-width: 1024px) {
        #switchBlock {width: 100%; height: auto;}
        #searchBlock {width: 100%; height: auto; min-height: 50px;}
      }

    </style>

    <div id='switchBlock'>
      <div id='info'>
        <slot id='infoButton' name='infoButton'></slot>
     </div>
      <div id='sliderSwitch'>
        <slot id='sliderSwitch' name='sliderSwitch'></slot>
      </div>
      <div id='languageSwitch'>
        <slot name='language'></slot>
      </div>
      <div id='unitsSwitch'>
        <slot name='unit'></slot>
      </div>
    </div>

    <div id='searchBlock'> 
      <form >
        <slot name='searchInput'></slot>
        <slot name='speechButton'></slot>
        <slot name='speakWeatherButton'></slot>
        <slot name='searchButton'></slot>
      </form>
    </div>
   `;

    this.initDOM();
    this.initEventListeners();

  }

  setState(propName, newPropState) {
    if (this.state[propName] != newPropState) {
      this.state[propName] = newPropState;
      this.setAttribute(propName, this.state[propName]);
    }
  }

  static get observedAttributes() {
    return ['currentlang', 'currenttempunit', 'isslideron']
  }

  attributeChangedCallback(item) {
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
          this.render(item);
        }
      }, 16)
    }
  }

}