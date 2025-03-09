import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isToday from "dayjs/plugin/isToday";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(isSameOrAfter);
dayjs.extend(isToday);
dayjs.extend(utc);
dayjs.extend(timezone);

export const startOfDayVN = dayjs()
  .tz("Asia/Ho_Chi_Minh")
  .startOf("day")
  .add(7, "hours")
  .toISOString();
export const endOfDayVN = dayjs()
  .tz("Asia/Ho_Chi_Minh")
  .endOf("day")
  .add(7, "hours")
  .toISOString();

export function isNextDay(inputTime: string) {
  const vietnamTime = dayjs.utc(inputTime).tz("Asia/Ho_Chi_Minh");
  const currentDayVN = dayjs().tz("Asia/Ho_Chi_Minh").add(7, "hours");
  return vietnamTime.isAfter(currentDayVN.startOf("day").add(1, "day"));
}

export default dayjs;
