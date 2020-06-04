import langSwitch from './eventFunctions/langButtonSwitch.js';
import unitSwitch from './eventFunctions/unitButtonSwitch.js';

export default function assEvents(state) {
  document.addEventListener('click', () => {
    let item = null;
    if (event.target.closest('div.langButton') != null) {
      item = event.target.closest('div.langButton');
    } else if (event.target.closest('div.unitButton') != null) {
      item = event.target.closest('div.unitButton');
    }
    if (item != null) {
      switch (item.classList[0]) {
        case 'langButton':
          langSwitch(item, state);
          break;
        case 'unitButton':
          unitSwitch(item, state);
          break;
      }
    }
  })

}