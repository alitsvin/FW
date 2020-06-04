export default function unitSwitch(clickTarget, state) {
  state.passState('currentTempUnit', clickTarget.id.slice(0, 1));
}