interface MMDateFormatterI18NLocaleRelative {
    yy: (value: number, isPast: boolean) => string;
    y: (value: number, isPast: boolean) => string;
    MM: (value: number, isPast: boolean) => string;
    M: (value: number, isPast: boolean) => string;
    dd: (value: number, isPast: boolean) => string;
    d: (value: number, isPast: boolean) => string;
    hh: (value: number, isPast: boolean) => string;
    h: (value: number, isPast: boolean) => string;
    mm: (value: number, isPast: boolean) => string;
    m: (value: number, isPast: boolean) => string;
    s: (value: number, isPast: boolean) => string;
}
interface MMDateFormatterI18NLocale {
    shortDayNames: string[];
    longDayNames: string[];
    shortMonthNames: string[];
    longMonthNames: string[];
    relative: MMDateFormatterI18NLocaleRelative;
}
export interface MMDateFormatterI18N {
    [locale: string]: Partial<MMDateFormatterI18NLocale>;
}
export declare class MMDateFormatter {
    protected _date?: Date;
    locale: string;
    static i18n: MMDateFormatterI18N;
    /**
     * @param _date
     * @param locale
     */
    constructor(_date?: Date, locale?: string);
    /**
     *
     */
    get date(): Date;
    /**
     * @param mask
     * @param utc
     * @param i18n
     */
    format(mask?: string, utc?: boolean, i18n?: Partial<MMDateFormatterI18NLocale>): string;
    /**
     * @param date
     * @param mask
     * @param locale
     * @param utc
     * @param i18n
     */
    static format(date: Date, mask?: any, locale?: string, utc?: boolean, i18n?: Partial<MMDateFormatterI18NLocale>): string;
    /**
     * @param delta (in seconds)
     * @private
     */
    protected static _diff(delta: number): {
        type: any;
        value: any;
        details: {
            delta: number;
            years: number;
            months: number;
            days: number;
            hours: number;
            minutes: number;
            seconds: number;
        };
    };
    /**
     * @param date
     * @param locale
     */
    static fromNow(date: Date, locale?: string): {
        isPast: boolean;
        isFuture: boolean;
        localized: any;
        type: any;
        value: any;
        details: {
            delta: number;
            years: number;
            months: number;
            days: number;
            hours: number;
            minutes: number;
            seconds: number;
        };
    };
    /**
     * @param date
     * @param compareTo
     * @param locale
     * @param i18n
     */
    static from(date: Date, compareTo: Date, locale?: string, i18n?: Partial<MMDateFormatterI18NLocaleRelative>): {
        isPast: boolean;
        isFuture: boolean;
        localized: any;
        type: any;
        value: any;
        details: {
            delta: number;
            years: number;
            months: number;
            days: number;
            hours: number;
            minutes: number;
            seconds: number;
        };
    };
}
export {};
