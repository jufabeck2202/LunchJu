import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(relativeTime);

dayjs.extend(isToday);

dayjs.extend(utc);


export const ToLocalTime = (date: string) => {
	return dayjs.utc(date).local().fromNow();
};

export const IsDateToday = (date: string) => {
	return dayjs.utc(date).local().isToday();
};
