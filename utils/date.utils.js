import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);

/**
 * @function formatDate
 * @author Maykel Esser
 * @description Format a date string to a given format. If the format is not provided, it will use the default format based on the user's locale.
 * @param {string} date - The date string to format
 * @param {string} [format] - The format to apply to the date
 * @returns {Date} The formatted date
 */
function formatDate({ date, format }) {
    if (!date) {
        throw new Error("The 'date' parameter is required.");
    }

    const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    dayjs.locale(userLocale);

    const parsedDate = dayjs(date);

    if (!parsedDate.isValid()) {
        throw new Error("Invalid date provided.");
    }

    // Define formato padrão baseado no locale
    const defaultFormat = format || dayjs().localeData().longDateFormat("L");

    return parsedDate.utc().format(defaultFormat);
}

export { formatDate };
