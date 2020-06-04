export default function langSwitch(clickTarget, state) {
  state.passState('currentLang', clickTarget.id.slice(0, 2));
}