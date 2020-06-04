import countryTeg from './Libs/countryTegs.js';
import state from '../state/state.js';

import ENlang from './Libs/EN.js'
import RUlang from './Libs/RU.js'
import BElang from './Libs/BE.js'

const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

export default class MapBlock extends HTMLElement {
  constructor() {
    super();
    this.state = {
      currentCity: 'Minsk',
      currentCountry: 'Belarus',
      currentLocation: "53.9000,27.5667",
      currentLang: 'EN',
      timezone: null,
    };

    this.settings = {
      currentLocationArr: null,
    };

    this.localState = {
      isReadyToWork: false,
    }

    this.dependences = {
      map: null,
    }

    this.langLib = {
      'RU': RUlang,
      'EN': ENlang,
      'BE': BElang,
    }

    this.optionsNames = {
      Latitude: 'Latitude',
      Longitude: 'Longitude',
    }

    this.isReadyToRenderArr = [];
  }

  async getCurrentGeo() {
    const APIkey = `eb6e4338f52b98`;
    const url = `https://ipinfo.io/json?token=${APIkey}`;
    return await fetch(url).then(res => res.json());
  }

  updateLocationArr() {
    this.settings.currentLocationArr = this.state.currentLocation.split(',').map((element) => Number.parseFloat(element)).reverse();
  }

  transformCoordToGrad(index) {
    let sign = "";
    if (this.state.currentLocation.split(',')[index] < 0) {
      sign = '-';
    }
    const grad = Math.trunc(Math.abs(this.state.currentLocation.split(',')[index]));
    const min = (Math.abs(this.state.currentLocation.split(',')[index]) - grad) * 60;
    const sec = Math.trunc((min - Math.trunc(min)) * 60);
    return `${sign}${grad}°${Math.trunc(min)}'${sec}"`;
  }


  render() {
    try {

      this.updateLocationArr();
      this.dependences.map.panTo(this.settings.currentLocationArr, { duration: 2000 });

      const lib = this.langLib[this.state.currentLang];
      for (let item in this.optionsNames) {
        this.optionsNames[item] = lib.options[item];
      }

      this.querySelectorAll('span[slot=coordinates]')
        .forEach((element, index) => {
          element.innerHTML = `${Object.values(this.optionsNames)[index]}: ${this.transformCoordToGrad(index)}`
        });
    }
    catch{ };
  }

  init() {
    const lib = this.langLib[this.state.currentLang];
    for (let item in this.optionsNames) {
      this.optionsNames[item] = lib.options[item];
    }

    this.insertAdjacentHTML('afterbegin', `
    <div id='map' slot='map'></div>
    <span slot='coordinates'>${Object.values(this.optionsNames)[0]}: ${this.transformCoordToGrad(0)}</span>
    <span slot='coordinates'>${Object.values(this.optionsNames)[1]}: ${this.transformCoordToGrad(1)}</span>
    `)
    mapboxgl.accessToken = 'pk.eyJ1IjoiYW5uaWVidW5ueW1iIiwiYSI6ImNrYXV3a3FyZDA2OHgycnU5MzJ0eWVtd20ifQ.VEDWv1Llwk54uBap2b8lFQ';
    this.dependences.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.settings.currentLocationArr,
      zoom: 9,
    });

  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML =
      `<style>
        div {display: flex; flex-direction: column;}
        #mapContainer {width: 80%; height: 50%; min-height: 350px; display:flex; justify-content: center; align-items: center; border: 1px solid white; border-radius: 10px;}
        #mapContainer div {width:95%; height: 95%; overflow:hidden; border-radius: 20px; }
        ::slotted(div) { width: 100%; height: 100%; min-height:300px;}
        ::slotted(span) {color: white;}
      </style>
      <div id='mapContainer'>
        <div >
          <slot name='map'></slot>
        </div>
      </div>
      <div id='coordinates'>
        <slot name='coordinates'></slot>
      </div>
    `;

    const geoPromise = this.getCurrentGeo();
    geoPromise.then((res) => {

      for (let item in this.state) {
        switch (item) {
          case 'currentCity':
            this.setState(item, res.city)
            state.getState(item, res.city, this);
            break;
          case 'currentCountry':
            this.setState(item, countryTeg[res.country])
            state.getState(item, countryTeg[res.country], this);
            break;
          case 'currentLocation':
            this.setState(item, res.loc)
            state.getState(item, res.loc, this);
            this.settings.currentLocationArr = this.state.currentLocation.split(',').map((element) => Number.parseFloat(element)).reverse();
            break;
          case 'timezone':
            this.setState(item, res.timezone)
            state.getState(item, res.timezone, this);
            break;
          default:
            this.setAttribute(item, this.state[item]);
            break;
        }
      }
      this.init();

      this.localState.isReadyToWork = true;

    })
  }

  setState(propName, newPropState) {
    if (this.state[propName] != newPropState) {
      this.state[propName] = newPropState;
      this.setAttribute(propName, this.state[propName]);
    }

  }

  static get observedAttributes() {
    return ['currentcity', 'currentlocation', 'currentlang'];
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
          this.render();
        }
      }, 16)
    }
  }


}