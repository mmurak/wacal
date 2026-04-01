class WesternCalendar {
	static format(p) {
		const bc = (p['AD'] == false) ? 'B.C.' : '';
		return `${bc}${p['year']}年 ${p['month']}月${p['day']}日`;
	}
}

class GregorianCalendar extends WesternCalendar {
	static toJulianDay(ad, year, month, day, hour=12, minute=0, second=0) {
		/// Returns the Julian day from Gregorian calendar date.
		///
		/// The function assumes 'proleptic' Gregorian calendar, when you
		/// specify the day before 'epoch.'
		/// Caller is responsible to pass the proper value as parameters.
		///
		/// Original formula: https://en.wikipedia.org/wiki/Julian_day
		if (ad == false) {     // means it's BC.
			year = -year + 1;
		}
		const jdn = Math.trunc((1461 * (year + 4800 + Math.trunc((month - 14) / 12))) / 4)
			+ Math.trunc((367 * (month - 2 - 12 * Math.trunc(((month - 14) / 12)))) / 12)
			- Math.trunc((3 * Math.trunc(((year + 4900 + Math.trunc((month - 14) / 12)) / 100))) / 4)
			+ day - 32075;
		const jd = jdn + (hour - 12.0) / 24.0 + minute / 1440.0 + second / 86400.0;
		return jd;
	}
	static toGregorianCalendar(jd) {
		/// Returns the Gregorian calendar date (in map) from Julian day,
		///
		/// If you specify the day before 'epoch,' the function would return
		/// the date in 'proleptic' Gregorian calendar.
		/// Caller is responsible to pass the proper value as parameters.
		///
		/// Original formula: https://en.wikipedia.org/wiki/Julian_day
		const f = Math.floor(jd) + 1401 + Math.trunc((Math.trunc(((4 * jd + 274277) / 146097)) * 3) / 4) - 38;
		const e = 4 * f + 3;
		const g = Math.trunc((e % 1461) / 4);
		const h = 5 * g + 2;
		const day = Math.trunc((h % 153) / 5) + 1;
		const month = (Math.trunc(h / 153) + 2) % 12 + 1;
		let year = Math.trunc(e / 1461) - 4716 + Math.trunc((12 + 2 - month) / 12);
		let ad = true;
		if (year <= 0) {
			ad = false;
			year = -year + 1;
		}
		let rest = (jd - Math.floor(jd)) * 86400.0;
		let hour = Math.trunc(rest / 3600);
		rest = rest - hour * 3600;
		const minute = Math.trunc(rest / 60);
		const second = rest - minute * 60;
		hour += 12;
		return {
			'AD': ad,
			'year': year,
			'month': month,
			'day': day,
			'hour': hour,
			'minute': minute,
			'second': second,
		};
	}
	static isProleptic(jd) {
		if (Math.trunc(jd) < 2299161) {   // 1582/10/15
			return true;    // It's a proleptic
		} else {
			return false;
		}
	}
	static isLeapYear(year) {
		if (year % 400 == 0) {
			return true;
		} else if (year % 100 == 0) {
			return false;
		} else if (year % 4 == 0) {
			return true;
		}
		return false;
	}

	static info(year) {
		const stemBranch = [];
		for (let i = 1; i <= 12; i++) {
			stemBranch.push(CyclicCalendar.getStemBranchFromNenTsuki(year, i));
		}
		return [
			['正月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
			[31, (GregorianCalendar.isLeapYear(year)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
			stemBranch,
		];
	}

}

class JulianCalendar extends WesternCalendar {
	static toJulianDay(year, month, day, hour=12, minute=0, second=0) {
		/// Returns the Julian day from Julian calendar date.
		///
		/// The function assumes 'proleptic' Julian calendar, when you
		/// specify the day before 'A.D. 8.'
		/// Caller is responsible to pass the proper value as parameters.
		///
		/// Original formula: https://en.wikipedia.org/wiki/Julian_day
		const jdn = 367 * year - Math.trunc((7 * (year + 5001 + Math.trunc((month - 9) / 7))) / 4)
			+ Math.trunc((275 * month) / 9) + day + 1729777;
		const jd = jdn + (hour - 12.0) / 24.0 + minute / 1440.0 + second / 86400.0;
		return jd;
	}
	static toJulianCalendar(jd) {
		/// Returns the Julian calendar date (in map) from Julian day,
		///
		/// If you specify the day before A.D. 8 the function would return
		/// the date in 'proleptic' Julian calendar.
		/// Caller is responsible to pass the proper value as parameters.
		///
		/// Original formula: https://en.wikipedia.org/wiki/Julian_day
		const  f = Math.floor(jd) + 1401;
		const e = 4 * f + 3;
		const g = Math.trunc((e % 1461) / 4);
		const h = 5 * g + 2;
		const day = Math.trunc((h % 153) / 5) + 1;
		const month = (Math.trunc(h / 153) + 2) % 12 + 1;
		let year = (Math.trunc(e / 1461)) - 4716 + Math.trunc((12 + 2 - month) / 12);
		let ad = true;
		if (year <= 0) {
			ad = false;
			year = -year + 1;
		}
		let rest = (jd - Math.floor(jd)) * 86400.0;
		let hour = Math.trunc(rest / 3600);
		rest= rest - hour * 3600;
		const minute = Math.trunc(rest / 60);
		const second = rest - minute * 60;
		hour += 12;
		return {
			'AD': ad,
			'year': year,
			'month': month,
			'day': day,
			'hour': hour,
			'minute': minute,
			'second': second
		};
	}
	static isLeapYear(year) {
		if (year % 400 == 0) {
			return true;
		}
		return false;
	}
}