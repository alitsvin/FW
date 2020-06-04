import BElang from '../Libs/BE.js';

export default class Clock extends HTMLElement {
  constructor() {
    super();
    this.settings = {
      dateFormat: {
        'EN': 'en-GB',
        'RU': 'ru-RU',
        'BE': 'be-BY'
      },
    }
    this.state = {
      currentDateFormat: 'BE',
      timezone: null,
    }

    this.isReadyToRenderArr = [];
  }

  render(dateFormat) {
    let date = new Date(this.getAttribute('dateTime') || Date.now());
    this.date = new Intl.DateTimeFormat(dateFormat, {
      timeZone: this.getAttribute('timezone') || undefined,
      year: this.getAttribute('year') || undefined,
      month: this.getAttribute('month') || undefined,
      day: this.getAttribute('day') || undefined,
      weekday: this.getAttribute('weekday') || undefined,
      timeZoneName: this.getAttribute('timeZoneName') || undefined,
    }).format(date);

    this.time = new Intl.DateTimeFormat(dateFormat, {
      timeZone: this.getAttribute('timezone') || undefined,
      hour: this.getAttribute('hour') || undefined,
      minute: this.getAttribute('minute') || undefined,
      second: this.getAttribute('second') || undefined,
      timeZoneName: this.getAttribute('timeZoneName') || undefined,
    }).format(date);

    if (this.state.currentDateFormat == 'BE') {
      this.date = BElang.days[this.date.split(',')[0]] + ", " + this.date.split(',')[1];
    }

    this.innerHTML = `<div>${this.date}</div><div>${this.time}</div>`
  }

  setState(propName, newPropState) {
    this.state[propName] = newPropState;
    this.setAttribute(propName, this.state[propName]);
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render(this.settings.dateFormat[this.state.currentDateFormat]);
      this.rendered = true;
    }
  }

  static get observedAttributes() {
    return ['datetime', 'year', 'month', 'day', 'hour', 'minute', 'second', 'timezone', 'currentdateformat'];
  }

  attributeChangedCallback(name) {
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
        this.render(this.settings.dateFormat[this.state.currentDateFormat]);
      }
    }, 16)

  }

}