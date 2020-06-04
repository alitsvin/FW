import BackgroundSlider from './js/obj/backgroundSlider.js';
import ControlPanel from './js/obj/controlPanel.js';
import WeatherToday from './js/obj/weatherToday.js';
import MapBlock from './js/obj/Map.js';
import InfoBlock from './js/obj/otherComponents/info';

import state from './js/state/state.js';

import ENlang from './js/obj/Libs/EN.js';
import RUlang from './js/obj/Libs/RU.js';
import BElang from './js/obj/Libs/BE.js';
import CodeSpray from './js/obj/Libs/speechCodeSpray.js';

customElements.define('info-block', InfoBlock);

customElements.define('background-slider', BackgroundSlider);
const slider = document.querySelector('background-slider');

customElements.define('weather-today', WeatherToday);
const weatherToday = document.querySelector('weather-today');

customElements.define('control-panel', ControlPanel);
const controlPanel = document.querySelector('control-panel');

customElements.define('map-block', MapBlock);
const mapBlock = document.querySelector('map-block');

state.copyState(weatherToday);
state.copyState(slider);
state.copyState(controlPanel);
state.copyState(mapBlock);

state.checkItemReadiness();

import addEvents from './js/events/clickEvent.js'
addEvents(state);

import "./css/main.css"
import "./scss/main.scss"

