import convertStrToUrL from './covertStrToUrl.js'

export default async function translateIt(str, currentLang) {
  const translKey = `trnsl.1.1.20200509T230835Z.b6eb436ae60e08e7.568e8f9d9335574c9f4ae03e74c63953b4dbf99c`;
  const translStr = convertStrToUrL(str);

  const detectUrl = `https://translate.yandex.net/api/v1.5/tr.json/detect?key=${translKey}&text=${translStr}&hint=ru,be,en`;
  const detectRes = await fetch(detectUrl).then(res => res.json());

  const translUrl = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${translKey}&text=${translStr}&lang=${detectRes.lang}-${currentLang.toLowerCase()}`;
  const res = await fetch(translUrl);
  const data = await res.json();
  return data.text[0].match(/[^\s]+/g).join(' ');
}