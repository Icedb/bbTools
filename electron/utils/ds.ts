import md5 from "md5";

function randomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getQueryParam(data: any) {
  let arr = [];

  if (undefined === data) {
    return "";
  }

  for (const key of Object.keys(data)) {
    arr.push(`${key}=${data[key]}`);
  }

  return arr.join("&");
}

function getDS(query: any, body = "") {
  const n = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs";
  const i = (Date.now() / 1000) | 0;
  const r = randomString(6);
  const q = getQueryParam(query);
  const c = md5(`salt=${n}&t=${i}&r=${r}&b=${body}&q=${q}`);
  return `${i},${r},${c}`;
}

export default getDS;

