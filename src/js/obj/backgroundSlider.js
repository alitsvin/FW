export default class BackgroundSlider extends HTMLElement {
  constructor() {
    super();
    this.state = {
    };
    this.localState = {
      isReadyToWork: true,
    }
    this.settings = {
      scrollingDuractionSec: 5,
      slideChangeTimingSec: 0.1,
    }
  }

  scrollSlide() {
    setTimeout(() => {
      this.slideArr.forEach((element) => {
        element.classList.add('scrolled');
        element.style.transform = `translateX(-100vw)`;
      })

      setTimeout(() => {
        this.slideArr.forEach((element) => {
          element.classList.remove('scrolled');
          element.style.transform = `translateX(0vw)`;
        })
        this.slideArr[0].remove();
      }, this.settings.scrollingDuractionSec * 1000);
    }, this.settings.slideChangeTimingSec * 1000);
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
        <style> 
          div {display:flex; flex-direction:row; justify-content:flex-start; align-items:center;}
          ::slotted(img) {  width:100%; height:100%; z-index: 21; object-fit: cover; filter: brightness(40%)}
          ::slotted(img.scrolled) { transition-property: transform; transition-duration: ${this.settings.scrollingDuractionSec}s;}
        </style>
        <div>
        <slot name='backgroundImg'></slot>
        </div>`;

    this.newImg = document.createElement(`img`);
    this.newImg.src = 'assets/img/1.jpg';
    this.newImg.setAttribute(`slot`, `backgroundImg`);
    this.newImg.onload = () => {
      this.appendChild(this.newImg);
      this.slideArr = this.querySelectorAll('img');
    }
    this.uploadNewSlide();

  }

  setState(propName, newPropState) {
    if (this.state[propName] != newPropState) {
      this.state[propName] = newPropState;
    }
  }

  async uploadNewSlide(weatherState, daytime) {
    const newImg = document.createElement(`img`);
    newImg.setAttribute(`slot`, `backgroundImg`);
    newImg.onload = () => {
      this.appendChild(newImg);
      this.slideArr = this.querySelectorAll('img');
      this.state.isImgUploaded = true;
      this.scrollSlide();
    }
    let search = 'summer';
    const h = new Date(Date.now())
    if (h.getHours() < 6 || h.getHours() > 22) {
      search += '+night';
    }
    const url = `https://api.unsplash.com/photos/random?orientation=landscape&er_page=1&query=${search}&client_id=ov4-b5c-bGo4FIB1KcQg-d7FCpNZw56eZ3NfycMWNEw`;
    console.log(url);
    const fetchData = await fetch(url);
    let data = null;
    if (fetchData.ok) {
      const data = await fetchData.json();
      newImg.src = data.urls.full;
    } else {
      newImg.src = `assets/img/1.jpg`;
    }

  }
}