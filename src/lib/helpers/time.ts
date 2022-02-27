import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import isToday from 'dayjs/plugin/isToday.js';
import weekday from 'dayjs/plugin/weekday.js';
import localeData from 'dayjs/plugin/localizedFormat.js';
dayjs.extend(relativeTime);
dayjs.extend(localeData);
dayjs.extend(isToday);
dayjs.extend(weekday);
dayjs.extend(utc);
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];



export const ToLocalTime = (date: string) => {
	return dayjs.utc(date).local().fromNow();
};
export const GetDay = (date: string) => {
	return weekdays[dayjs.utc(date).local().weekday()];
};

export const IsDateToday = (date: string) => {
	return dayjs.utc(date).local().isToday();
};

export const GetDateMonthYear = (date: string) => {
	return dayjs.utc(date).local().format('DD MMM YYYY');
};