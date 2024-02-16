import numeral from 'numeral';
import { addSeperator }  from './number-to-text-vietnamese/utils';
// ----------------------------------------------------------------------
numeral.register("locale", "vi", {
  delimiters: {
    thousands: ".",
    decimal: ".",
  },
  abbreviations: {
    thousand: "k",
    million: "tr",
    billion: "tỷ",
    trillion: "nghìn tỷ",
  },
  ordinal(number) {
    return number;
  },
  currency: {
    symbol: "đ",
  },
});

numeral.locale("vi");

export function fNumber(number) {
  return numeral(number).format();
}

export function fCurrency(number) {
  const format = number ? numeral(number).format('$0,0.00') : '';

  return result(format, '.00');
}

export function fPercent(number) {
  const format = number ? numeral(Number(number) / 100).format('0.0%') : '';

  return result(format, '.0');
}

export function fShortenNumber(number) {
  const format = number ? numeral(number).format('0.00a') : '';

  return result(format, '.00');
}

export function fData(number) {
  const format = number ? numeral(number).format('0.0 b') : '';

  return result(format, '.0');
}

function result(format, key = '.00') {
  const isInteger = format.includes(key);

  return isInteger ? format.replace(key, '') : format;
}


export function currencyFormatter(params) {
  let value = (params === '' || params === undefined || params === null) ? 0 : params;
  if (value === 0) return '';
  value = parseFloat(value.toString().replace(/,/g, ""));
  value = formatNumber(value);
  if (value === 'NaN') value = '';
  if (value.length >= 20) {
    value = value.slice(0, 20);
  }
  return value;
}

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export function formatPriceNumber(value) {
  if (value === '') return value;
  return parseFloat(value.toString().replace(/,/g, ""))
}