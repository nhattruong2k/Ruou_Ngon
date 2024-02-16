import { format, getTime, formatDistanceToNow } from 'date-fns';
import moment from 'moment';
import { vi } from "date-fns/locale";
// ----------------------------------------------------------------------
export function stringDate(date) {
  if (date) {
    return moment(date).format('DD/MM/YYYY');
  }
  return '';
}

export function stringDateTime(date) {
  if (date) {
    return moment(date).format('DD/MM/YYYY HH:mm');
  }
  return '';
}

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: vi,
    })
    : '';
}
