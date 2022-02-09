import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localizedFormat';
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
