class State {
  constructor() {
    this.state = {
      currentLang: 'EN',
      currentTempUnit: 'C',
    };
    this.itemsArr = [];
    this.itemsReadyArr = [];
    this.isReadyToWork = false;
  }

  copyState(target) {
    Object.assign(this.state, target.state)
    this.itemsArr.push(target);
    this.itemsReadyArr.push(false);
  }

  passState(propName, newPropState, targetArr = this.itemsArr) {
    this.state[propName] = newPropState;

    if (this.isReadyToWork && ((propName == 'currentLang') || (propName == 'currentTempUnit'))) {
      localStorage.setItem(propName, newPropState);
    }

    for (let item of targetArr) {
      if (item.state.hasOwnProperty(propName)) {
        item.setState(propName, this.state[propName]);
      }
    }
  }

  getState(propName, newPropState, target) {
    const passToArr = this.itemsArr.filter((element) => element != target);
    this.passState(propName, newPropState, passToArr)
  }

  checkItemReadiness() {
    setTimeout(() => {
      let readyCheck = true;
      for (let i = 0; i < this.itemsArr.length; i += 1) {
        if (!this.itemsArr[i].localState.isReadyToWork) {
          this.checkItemReadiness()
          readyCheck = false;
          break;
        }
      }
      if (readyCheck) {
        this.isReadyToWork = true;
        if (localStorage.getItem('currentLang')) {
          this.state.currentLang = localStorage.getItem('currentLang')
          this.state.currentTempUnit = localStorage.getItem('currentTempUnit')
        } else {
          this.state.currentLang = 'EN';
          this.state.currentTempUnit = 'C';
        }

        for (let propName in this.state) {
          this.passState(propName, this.state[propName])
        }
      }
    }, 16);
  }
}

let state = new State();
export default state;
