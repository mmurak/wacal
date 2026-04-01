class CyclicCalendar {
	static wotd = ['日', '月', '火', '水', '木', '金', '土', ];
	static getWeekOfTheDay(jd) {
		const r = (jd + 1) % 7;
		if (r === 0) {
			return `<span style="color: red">${CyclicCalendar.wotd[(jd + 1) % 7]}</span>`;
		} else if (r === 6) {
			return `<span style="color: blue">${CyclicCalendar.wotd[(jd + 1) % 7]}</span>`;
		} else {
			return `${CyclicCalendar.wotd[(jd + 1) % 7]}`;
		}
	}
	static heavenlyStems = ['癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬'];
	static earthlyBranches = ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'];
	static getStemBranchFromNen(nen) {
		const offsetYear = nen + 57;
		return CyclicCalendar.heavenlyStems[offsetYear % 10]
			+ CyclicCalendar.earthlyBranches[offsetYear % 12];
	}
	static getStemBranchFromNenTsuki(nen, tsuki) {
		const offsetYear = nen + 57;
		return CyclicCalendar.heavenlyStems[((offsetYear % 5) * 2 + tsuki) % 10]
			+ CyclicCalendar.earthlyBranches[(tsuki + 2) % 12];
	}
	static getStemBranchFromJulianDay(jd) {
		return CyclicCalendar.heavenlyStems[jd % 10] + CyclicCalendar.earthlyBranches[(jd+2) % 12];
	}
}
