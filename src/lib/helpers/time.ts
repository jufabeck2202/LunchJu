import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);

dayjs.extend(utc);
console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
//convert utc date to local date
console.log(dayjs.utc('2022-02-06T21:28:18.069584').local().format('YYYY-MM-DD HH:mm:ss'));

//checks if day is today
console.log(dayjs.utc('2022-02-06T22:28:18.069584').local().isToday());

export const ToLocalTime = (date: string) => {
	return dayjs.utc(date).local().fromNow();
};

export const IsDateToday = (date: string) => {
	return dayjs.utc(date).local().isToday();
};
