import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { formatDate } from "utils/date.utils";

dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);

describe("formatDate", () => {
    it("Should format a valid date correctly with a given format", () => {
        const options = { date: "2024-12-30T15:00:00Z", format: "DD/MM/YYYY" };
        const result = formatDate(options);
        expect(result).toBe("30/12/2024");
    });

    it("Should throw an error if no date is provided", () => {
        expect(() => formatDate({})).toThrow(
            "The 'date' parameter is required.",
        );
    });

    it("Should throw an error for an invalid date", () => {
        const options = { date: "invalid-date", format: "DD/MM/YYYY" };
        expect(() => formatDate(options)).toThrow("Invalid date provided.");
    });

    it("Should format a valid date correctly using the default format when no format is provided", () => {
        const options = { date: "2024-12-30T15:00:00Z" };
        const detectedLocale = Intl.DateTimeFormat().resolvedOptions().locale;
        dayjs.locale(detectedLocale);
        const expectedFormat = dayjs(options.date)
            .utc()
            .format(dayjs().localeData().longDateFormat("L"));
        const result = formatDate(options);
        expect(result).toBe(expectedFormat);
    });
});
