export default function convertStrToUrL(cityName) {
  const badCharsLib = {
    ' ': '+',
    "\'": '',
    '-': '',
    ',': '+',
  }
  let cityUrl = cityName;
  const charArr = Object.keys(badCharsLib);
  for (let i = 0; i < charArr.length; i += 1) {
    const reg = RegExp(`${charArr[i]}`, 'g')
    cityUrl = cityUrl.replace(reg, badCharsLib[charArr[i]]);
  }
  return cityUrl;
}