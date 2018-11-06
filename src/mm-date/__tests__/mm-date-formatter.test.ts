import { MMDateFormatter } from '../mm-date-formatter';

test('empty constructor param is now', () => {
    const df = new MMDateFormatter();
    expect(isNaN(df.date as any)).toBeFalsy();
    expect(df.date.valueOf()).toBeTruthy(); // naive
});

test('format works', () => {
    const df = new MMDateFormatter(new Date('1984-01-02T03:04:05.678+0100'));
    let expected = {
        YY: '84',
        YYYY: '1984',
        M: '1',
        MM: '01',
        MMM: 'Jan',
        MMMM: 'January',
        D: '2',
        DD: '02',
        // d	0-6	The day of the week, with Sunday as 0
        d: '1',
        // dd	Su-Sa	The min name of the day of the week
        dd: 'Mo',
        // ddd	Sun-Sat	The short name of the day of the week
        ddd: 'Mon',
        // dddd	Sunday-Saturday	The name of the day of the week
        dddd: 'Monday',
        // H	0-23	The hour
        H: '3',
        // HH	00-23	The hour, 2-digits
        HH: '03',
        // h	1-12	The hour, 12-hour clock
        h: '3',
        // hh	01-12	The hour, 12-hour clock, 2-digits
        hh: '03',
        // m	0-59	The minute
        m: '4',
        // mm	00-59	The minute, 2-digits
        mm: '04',
        // s	0-59	The second
        s: '5',
        // ss	00-59	The second, 2-digits
        ss: '05',
        // SSS	000-999	The millisecond, 3-digits
        SSS: '678',
        // Z	+5:00	The offset from UTC
        Z: '+1:00',
        // ZZ	+0500	The offset from UTC, 2-digits
        ZZ: '+0100',
        // A	AM PM
        A: 'AM',
        // a	am pm
        a: 'am',
    };

    // one by one
    Object.keys(expected).forEach((k) => {
        expect(`${k} => ` + df.format(k)).toEqual(`${k} => ` + expected[k]);
    });

    let mask = Object.keys(expected)
        .sort()
        .join();
    expect(mask).toEqual(
        'A,D,DD,H,HH,M,MM,MMM,MMMM,SSS,YY,YYYY,Z,ZZ,a,d,dd,ddd,dddd,h,hh,m,mm,s,ss'
    );
    expect(df.format(mask)).toEqual(
        'AM,2,02,3,03,1,01,Jan,January,678,84,1984,+1:00,+0100,am,1,Mo,Mon,Monday,3,03,4,04,5,05'
    );
});

test('locale works', () => {
    const df = new MMDateFormatter(
        new Date('1984-01-02T03:04:05.678+0100'),
        'sk'
    );
    expect(
        df.format(
            'A,D,DD,H,HH,M,MM,MMM,MMMM,SSS,YY,YYYY,Z,ZZ,a,d,dd,ddd,dddd,h,hh,m,mm,s,ss'
        )
    ).toEqual(
        'AM,2,02,3,03,1,01,Jan,Január,678,84,1984,+1:00,+0100,am,1,Po,Pon,Pondelok,3,03,4,04,5,05'
    );
});

test('custom locale overrides', () => {
    const df = new MMDateFormatter(
        new Date('1984-01-02T03:04:05.678+0100'),
        'sk'
    );
    expect(
        df.format('MMM,MMMM,ddd,dddd', false, {
            shortDayNames: 'a,b,c,d,e,f,g'.split(','),
            longDayNames: 'aa,bb,cc,dd,ee,ff,gg'.split(','),
            shortMonthNames: '11,22,33,44,55,66,77,88,99,10,11,12'.split(','),
            longMonthNames: 'jj,ff,mm,aaa,mj,jn,jl,aa,ss,oo,nn,dd'.split(','),
        })
    ).toEqual('11,jj,b,bb');
});

test('relative: yy (18 months+)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01'),
        new Date('2008-02-23'),
        'sk'
    );
    expect({ type, value }).toEqual({ type: 'yy', value: 8 });
    expect(isPast).toBeTruthy();
    expect(localized).toEqual('pred 8 rokmi');
});

test('relative: y (11 months to 17 months)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2001-02-23'),
        new Date('2000-01-01'),
        'sk'
    );
    expect({ type, value }).toEqual({ type: 'y', value: 1 });
    expect(isPast).toBeFalsy();
    expect(localized).toEqual('za rok');
});

test('relative: MM (46 days to 10 months)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01'),
        new Date('2000-04-23')
    );
    expect({ type, value }).toEqual({ type: 'MM', value: 3 });
    expect(localized).toEqual('3 months ago');
});

test('relative: M (26 to 45 days)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01'),
        new Date('2000-01-27'),
        'sk'
    );
    // console.log(details);
    expect({ type, value }).toEqual({ type: 'M', value: 1 });
    expect(localized).toEqual('pred mesiacom');
});

test('relative: dd (36 hours to 25 days)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01'),
        new Date('2000-01-20'),
        'sk'
    );
    expect({ type, value }).toEqual({ type: 'dd', value: 19 });
    expect(localized).toEqual('pred 19 dňami');
});

test('relative: d (22 to 35 hours)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01 23:50:00'),
        new Date('2000-01-01 01:00:00')
    );
    expect({ type, value }).toEqual({ type: 'd', value: 1 });
    expect(localized).toEqual('in a day');
});

test('relative: hh (90 minutes to 21 hours)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01 01:00:00'),
        new Date('2000-01-01 03:50:00')
    );
    // console.log(details);
    expect({ type, value }).toEqual({ type: 'hh', value: 2 });
    expect(localized).toEqual('2 hours ago');
});

test('relative: h (45 to 89 minutes)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01 01:00:00'),
        new Date('2000-01-01 02:10:00')
    );
    // console.log(details);
    expect({ type, value }).toEqual({ type: 'h', value: 1 });
    expect(localized).toEqual('an hour ago');
});

test('relative: mm (90 seconds to 44 minutes)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01 01:40:00'),
        new Date('2000-01-01 01:00:00')
    );
    // console.log(details);
    expect({ type, value }).toEqual({ type: 'mm', value: 40 });
    expect(localized).toEqual('in 40 minutes');
});

test('relative: m (45 to 89 seconds)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01 01:00:00'),
        new Date('2000-01-01 01:00:50')
    );
    // console.log(details);
    expect({ type, value }).toEqual({ type: 'm', value: 1 });
    expect(localized).toEqual('a minute ago');
});

test('relative: s (0 to 44 seconds)', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01 01:00:40'),
        new Date('2000-01-01 01:00:00')
    );
    // console.log(details);
    expect({ type, value }).toEqual({ type: 's', value: 40 });
    expect(localized).toEqual('in a few seconds');
});

test('relative: s custom translation', () => {
    let { type, value, details, isPast, localized } = MMDateFormatter.from(
        new Date('2000-01-01 01:00:40'),
        new Date('2000-01-01 01:00:00'),
        'sk',
        {
            s: (v, p) => 'práve teraz'
        }
    );
    expect({ type, value }).toEqual({ type: 's', value: 40 });
    expect(localized).toEqual('práve teraz');
});
