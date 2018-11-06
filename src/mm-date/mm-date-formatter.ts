/**
 * Initialy insired from:
 * Date Format 1.2.3, (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * http://blog.stevenlevithan.com/archives/date-time-format
 */
import { mmEscapeRegExp, mmReplaceMap } from '../mm-string';
import { mmIsValidDate } from './mm-date';
import { min } from 'lodash-es';

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

export class MMDateFormatter {
    // prettier-ignore
    static i18n: MMDateFormatterI18N = {
        en: {
            shortDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longDayNames: [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
            ],
            shortMonthNames: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
            ],
            longMonthNames: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
            ],
            relative: {
                yy: (v, isPast) => isPast ? `${v} years ago`    : `in ${v} years`,
                y: (v, isPast)  => isPast ? `a year ago`        : `in a year`,
                MM: (v, isPast) => isPast ? `${v} months ago`   : `in ${v} months`,
                M: (v, isPast)  => isPast ? `a month ago`       : `in a month`,
                dd: (v, isPast) => isPast ? `${v} days ago`     : `in ${v} days`,
                d: (v, isPast)  => isPast ? `a day ago`         : `in a day`,
                hh: (v, isPast) => isPast ? `${v} hours ago`    : `in ${v} hours`,
                h: (v, isPast)  => isPast ? `an hour ago`       : `in an hour`,
                mm: (v, isPast) => isPast ? `${v} minutes ago`  : `in ${v} minutes`,
                m: (v, isPast)  => isPast ? `a minute ago`      : `in a minute`,
                s: (v, isPast)  => isPast ? `a few seconds ago` : `in a few seconds`,
            }
        },
        sk: {
            shortDayNames: ['Ned', 'Pon', 'Uto', 'Str', 'Štv', 'Pia', 'Sob'],
            longDayNames: [
                'Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota',
            ],
            shortMonthNames: [
                'Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún',
                'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec',
            ],
            longMonthNames: [
                'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
                'Júl', 'August', 'September', 'Október', 'November', 'December',
            ],
            relative: {
                yy: (v, isPast) => isPast ? `pred ${v} rokmi`    : `za ${v} rok${v < 5 ? 'y' : 'ov'}`,
                y: (v, isPast)  => isPast ? `pred rokom`         : `za rok`,
                MM: (v, isPast) => isPast ? `pred ${v} mesiacmi` : `za ${v} mesiac${v < 5 ? 'e' : 'ov'}`,
                M: (v, isPast)  => isPast ? `pred mesiacom`      : `za mesiac`,
                dd: (v, isPast) => isPast ? `pred ${v} dňami`    : `za ${v} dn${v < 5 ? 'i' : 'í' }`,
                d: (v, isPast)  => isPast ? `včera`              : `zajtra`,
                hh: (v, isPast) => isPast ? `pred ${v} hodinami` : `za ${v} hod${v < 5 ? 'iny' : 'ín'}`,
                h: (v, isPast)  => isPast ? `pred hodinou`       : `za hodinu`,
                mm: (v, isPast) => isPast ? `pred ${v} minútami` : `za ${v} minút${v < 5 ? 'y' : ''}`,
                m: (v, isPast)  => isPast ? `pred minútou`       : `za minútu`,
                s: (v, isPast)  => isPast ? `pred pár sekundami` : `za pár sekúnd`,
            }
        },
    };

    /**
     * @param _date
     * @param locale
     */
    constructor(protected _date?: Date, public locale = 'en') {
        this._date = this._date || new Date();
    }

    /**
     *
     */
    get date() {
        return this._date;
    }

    /**
     * @param mask
     * @param utc
     * @param i18n
     */
    format(
        mask?: string,
        utc: boolean = false,
        i18n?: Partial<MMDateFormatterI18NLocale>
    ) {
        return MMDateFormatter.format(this.date, mask, this.locale, utc, i18n);
    }

    /**
     * @param date
     * @param mask
     * @param locale
     * @param utc
     * @param i18n
     */
    static format(
        date: Date,
        mask?,
        locale = 'en',
        utc: boolean = false,
        i18n?: Partial<MMDateFormatterI18NLocale>
    ): string {
        if (!mmIsValidDate(date)) {
            throw new Error(`Invalid date ${date}`);
        }

        if (!MMDateFormatter.i18n[locale]) {
            throw new Error(`Invalid locale ${locale}`);
        }

        if (!mask || typeof mask !== 'string') {
            return date.toISOString();
        }

        const pad = (val, len = 2) => {
            val = `${val}`;
            while (val.length < len) {
                val = `0${val}`;
            }
            return val;
        };

        const _ = utc ? 'getUTC' : 'get';
        const _Date = date[_ + 'Date']();
        const Day = date[_ + 'Day']();
        const Month = date[_ + 'Month']();
        const FullYear = date[_ + 'FullYear']();
        const Hours = date[_ + 'Hours']();
        const Minutes = date[_ + 'Minutes']();
        const Seconds = date[_ + 'Seconds']();
        const Milliseconds = date[_ + 'Milliseconds']();
        const TZOffset = utc ? 0 : date.getTimezoneOffset();

        const _i18n = (k) => {
            let t = {
                ...(MMDateFormatter.i18n[locale] || {}),
                ...(i18n || {}),
            };
            return t[k] || {};
        };

        const ZZ = () =>
            (TZOffset > 0 ? '-' : '+') +
            pad(
                Math.floor(Math.abs(TZOffset) / 60) * 100 +
                    (Math.abs(TZOffset) % 60),
                4
            );

        const replaceMap = {
            // YY	18	Two-digit year
            YY: () => `${FullYear}`.slice(2),
            // YYYY	2018	Four-digit year
            YYYY: () => FullYear,
            // M	1-12	The month, beginning at 1
            M: () => Month + 1,
            // MM	01-12	The month, 2-digits
            MM: () => pad(Month + 1),
            // MMM	Jan-Dec	The abbreviated month name
            MMM: () => _i18n('shortMonthNames')[Month],
            // MMMM	January-December	The full month name
            MMMM: () => _i18n('longMonthNames')[Month],
            // D	1-31	The day of the month
            D: () => _Date,
            // DD	01-31	The day of the month, 2-digits
            DD: () => pad(_Date),
            // d	0-6	The day of the week, with Sunday as 0
            d: () => Day,
            //     dd	Su-Sa	The min name of the day of the week
            dd: () => (_i18n('shortDayNames')[Day] || '').substr(0, 2),
            // ddd	Sun-Sat	The short name of the day of the week
            ddd: () => _i18n('shortDayNames')[Day] || '',
            // dddd	Sunday-Saturday	The name of the day of the week
            dddd: () => _i18n('longDayNames')[Day] || '',
            // H	0-23	The hour
            H: () => Hours,
            // HH	00-23	The hour, 2-digits
            HH: () => pad(Hours),
            // h	1-12	The hour, 12-hour clock
            h: () => Hours % 12 || 12,
            // hh	01-12	The hour, 12-hour clock, 2-digits
            hh: () => pad(Hours % 12 || 12),
            // m	0-59	The minute
            m: () => Minutes,
            // mm	00-59	The minute, 2-digits
            mm: () => pad(Minutes),
            // s	0-59	The second
            s: () => Seconds,
            // ss	00-59	The second, 2-digits
            ss: () => pad(Seconds),
            // SSS	000-999	The millisecond, 3-digits
            SSS: () => pad(Milliseconds, 3),
            // A	AM PM
            A: () => (Hours < 12 ? 'AM' : 'PM'),
            // a	am pm
            a: () => (Hours < 12 ? 'am' : 'pm'),
            // Z	+5:00	The offset from UTC
            Z: () => {
                let _ZZ = ZZ();
                return [
                    _ZZ.substr(0, 1),
                    _ZZ.substr(1, 2).replace(/^0+/, ''),
                    ':',
                    _ZZ.substr(3, 2),
                ].join('');
            },
            // ZZ	+0500	The offset from UTC, 2-digits
            ZZ,
            // unix milliseconds
            x: () => Milliseconds,
            // unix seconds
            X: () => Math.round(Milliseconds / 1000),
        };

        const patterns = [];

        const keys = Object.keys(replaceMap);
        keys.sort().reverse(); // sort desc, hm...

        keys.forEach((k) => patterns.push(mmEscapeRegExp(k)));
        const rgx = new RegExp(patterns.join('|'), 'g');

        return mask.replace(rgx, ($0) => {
            return $0 in replaceMap ? replaceMap[$0]() : '';
        });
    }

    protected static _diff(deltaSeconds: number) {
        const SEC_PER_DAY = 86400; // 60 * 60 * 24;

        //
        const seconds = deltaSeconds % 60;
        const minutes = Math.floor(deltaSeconds / 60);
        const hours = Math.floor(deltaSeconds / 3600);
        //
        const days = Math.floor(deltaSeconds / SEC_PER_DAY);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        const out = (type, value) => ({
            type,
            value,
            details: { years, months, days, hours, minutes, seconds },
        });

        const min2sec = (_min) => _min * 60;
        const hours2sec = (_hours) => _hours * 60 * 60;
        const days2sec = (_days) => _days * SEC_PER_DAY;
        const months2sec = (_months) => days2sec(_months * 30);

        // https://github.com/iamkun/dayjs/blob/master/docs/en/Plugin.md#relativetime

        // 18 months+	yy	2 years ago ... 20 years ago
        if (deltaSeconds >= months2sec(18)) {
            return out('yy', years);
        }
        // 11 months to 17 months	y	a year ago
        else if (deltaSeconds >= months2sec(11)) {
            return out('y', 1);
        }
        // 46 days to 10 months	MM	2 months ago ... 10 months ago
        else if (deltaSeconds >= days2sec(46)) {
            return out('MM', months);
        }
        // 26 to 45 days	M	a month ago
        else if (deltaSeconds >= days2sec(26)) {
            return out('M', 1);
        }
        // 36 hours to 25 days	dd	2 days ago ... 25 days ago
        else if (deltaSeconds >= hours2sec(36)) {
            return out('dd', days);
        }
        // 22 to 35 hours	d	a day ago
        else if (deltaSeconds >= hours2sec(22)) {
            return out('d', 1);
        }
        // 90 minutes to 21 hours	hh	2 hours ago ... 21 hours ago
        else if (deltaSeconds >= min2sec(90)) {
            return out('hh', hours);
        }
        // 45 to 89 minutes	h	an hour ago
        else if (deltaSeconds >= min2sec(45)) {
            return out('h', 1);
        }
        // 90 seconds to 44 minutes	mm	2 minutes ago ... 44 minutes ago
        else if (deltaSeconds >= 90) {
            return out('mm', minutes);
        }
        // 45 to 89 seconds	m	a minute ago
        else if (deltaSeconds >= 45) {
            return out('m', 1);
        }
        // 0 to 44 seconds	s	a few seconds ago
        return out('s', seconds);
    }

    static fromNow(date: Date, locale = 'en') {
        return MMDateFormatter.from(date, new Date(), locale);
    }

    static from(date: Date, compareTo: Date, locale = 'en', i18n?: Partial<MMDateFormatterI18NLocaleRelative>) {
        if (!mmIsValidDate(date) || !mmIsValidDate(compareTo)) {
            throw new Error(`Invalid date(s)`);
        }

        if (!MMDateFormatter.i18n[locale]) {
            throw new Error(`Invalid locale ${locale}`);
        }

        let deltaSeconds = Math.round(
            Math.abs(date.valueOf() - compareTo.valueOf()) / 1000
        );

        let res = MMDateFormatter._diff(deltaSeconds);
        const isPast = date < compareTo;

        const _i18n = (k, _val, _isPast) => {
            let t = {
                ...((MMDateFormatter.i18n[locale] || {}).relative || {}),
                ...(i18n || {}),
            };
            return t[k] ? t[k](_val, _isPast) : `${k},${_val},${_isPast}`;
        };

        return {
            ...res,
            isPast,
            isFuture: !isPast,
            localized: _i18n(res.type, res.value, isPast),
        };
    }
}
