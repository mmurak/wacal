// 基本データテーブル関連
const GENGOU = 0;
// const YOMI = 1;
const STARTNEN = 2;
const STARTJD = 3;
const ENDJD = 4;

const eraDict = {};

// 基本データテーブルの辞書化（元号→開始年、開始JD、終了JD）
for (const entry of _eraArray) {
	const eraName = entry[GENGOU];
	if (!(eraName in eraDict)) {
		eraDict[eraName] = [entry[STARTNEN], entry[STARTJD], entry[ENDJD]];
	}
}

// 詳細データテーブル（[閏月、[月内の日数]]）関連
const _startYear = 645;			// original data starts from 445
const _startJD = 1956677;	// original data starts from 1883618
const _endYear = 1872;
const _endJD = 2405159;

const jcalendar = [];		// 和年→閏月、[開始JD]、[月内の日数]
const jdtable = [];			// [正月一日のJD]
let ycount = _startYear;
let jd = _startJD;
for (let ent of _lunisolarArray) {
	const leapMonth = ent[0];
	const daysOfMonth = ent[1];
	const startJDofMonth = [];
	jdtable.push(jd);
	for (let d of daysOfMonth) {
		startJDofMonth.push(jd);
		jd += d;
	}
	const resultEnt = [];
	resultEnt.push(leapMonth);
	resultEnt.push(startJDofMonth);
	resultEnt.push(daysOfMonth);
	jcalendar[ycount] = resultEnt;
	ycount += 1;
}




// 元号と和年から、4桁年を返す
function getLunisolarYearGN(gengou, nen) {
	const sYsJeJ = eraDict[gengou] ?? [];
	if (sYsJeJ.length > 0) {
		return sYsJeJ[0] + nen - 1;
	} else {
		return 0;
	}
}

// 元号と和年、閏、月、日からユリウス通日を返す
function getJulianDay(gengou, nen, uruu, tsuki, hi) {
	// eraDict{} テーブルは開始年、開始JD、終了JDなのでインデックスとしては即値を使用している
	let jd = 0;
	let year = getLunisolarYearGN(gengou, nen);
	if (year == 0) { // Not found
		return 0;
	}
	if (year > 1872) {
		jd = Math.floor(GregorianCalendar.toJulianDay(true, year, tsuki, hi));		// gregorian2JulianDay returns double value
	} else {
		jd = getJD(year, uruu, tsuki, hi);
	}
	return jd;
}

// 4桁年、閏、月、日からユリウス通日を返す
// （getJulianDayのサブロジック）
function getJD(year, leapFlag, month, day) {
	if ((year < _startYear) || (year > _endYear)) {
		return 0;
	}
	const yearDef = jcalendar[year] ?? [];
	if (yearDef == []) {
		throw Exception();
	}
	let leap = yearDef[0];
	const monthJD = yearDef[1];
	if (leapFlag) {
		if (month != leap) {
			return 0;
		} else {
			// leap Month : NOP
		}
	} else {
		if (leap == 0) {
			leap = 13;
		}
		if (month <= leap) {
			month -= 1;
		}
	}
	return monthJD[month] + day - 1;
}

// ユリウス通日から元号並立期にあるかどうかをtrue/falseで返す
function _parallelEra(julianDay) {		// returns true if the julianDay is in parallel period.
	for (const entry of splitDispatcher) {
		if ((entry[0] <= julianDay) && (julianDay <= entry[1])) {
			return true;
		}
	}
	return false;
}

// データソースとユリウス通日から、昇順で対象データ（終了日ベース）を返す
function _findFromTBLinc(dataSource, jd) {
	const ll = dataSource.length;
	let idx = 0;
	while ((idx < ll) && (dataSource[idx][ENDJD] < jd)) {		// compare w/ end date
		idx++;
	}
	if (idx == ll) {
		return [];
	} else {
		return dataSource[idx];
	}
}

// データソースとユリウス通日から、降順で対象データ（開始日ベース）を返す
function _findFromTBLdec(dataSource, jd) {
	let idx = dataSource.length - 1;
	while ((idx >= 0) && (dataSource[idx][STARTJD] > jd)) {		// compare w/ start date
		idx--;
	}
	if (idx < 0) {
		return [];
	} else {
		return dataSource[idx];
	}
}

// ユリウス通日から和暦構造体を配列で返す（元号並立期は2つ目の要素が設定される）
function getJapaneseDate(julianDay) {
	if (_parallelEra(julianDay)) {    // Parallel era
		const white = _findSingleEra(whiteEraTable, julianDay);
		const red = _findSingleEra(redEraTable, julianDay);
		return [white, red];
	} else {    // Single era
		const jdate = _findSingleEra(_eraArray, julianDay);
		return [jdate];
	}
}

// データソースとユリウス通日から和暦構造体を返す
// （getJapaneseDateのサブロジック）
function _findSingleEra(dataSource, jd) {
	const data1 = _findFromTBLinc(dataSource, jd);	// search by increment
	if (!data1.length > 0 || data1[STARTJD] > jd) {		// in case of gengou not found or out of range
		return {};
	}
	const eraname1 = data1[GENGOU];
	const firstYear1 = data1[STARTNEN];

	const data2 =_findFromTBLdec(dataSource, jd);		// search by decrement
	if (!data2.length > 0 || data2[ENDJD] < jd) {			// in case of gengou not found or out of range
		return {};
	}
	const eraname2 = data2[GENGOU];
	const firstYear2 = data2[STARTNEN];

	const info = getLunisolarCalendar(jd);
	if (Object.keys(info).length > 0) {
		return _japaneseCalendarStruct(info['年'], eraname1, firstYear1, eraname2, firstYear2, info['閏'], info['月'], info['日']);
	} else {		// This path is for the solar calendar in Meiji era.
		const ginfo = GregorianCalendar.toGregorianCalendar(jd);
		return _japaneseCalendarStruct(ginfo['year'], eraname1, firstYear1, eraname2, firstYear2, false, ginfo['month'], ginfo['day']);
	}
}

// 4桁年、元号1、開始年1、元号2、開始年2、閏、月、日から和暦構造体を返す
// （前から検索と後ろから検索の結果（AとB）が同じ場合はここでマージされる）
// （_findSingleEraのサブロジック）
function _japaneseCalendarStruct(year, gengou1, startNen1, gengou2, startNen2, uruu, tsuki, hi) {
	const g2 = (gengou1 == gengou2) ? '' : gengou2;
	const y2 = (gengou1 == gengou2) ? 0 : year - startNen2 + 1;
	return {
		'元号A': gengou1,
		'年A': year - startNen1 + 1,
		'元号B': g2,
		'年B': y2,
		'閏': uruu,
		'月': tsuki,
		'日': hi,
	};
}

// 元号から開始JD、終了JDの配列を返す
function getEraInformation(gengou) {
	if (gengou in eraDict) {
		const resultJD = eraDict[gengou] ?? [0, 0, 0];
		return [resultJD[1], resultJD[2]];
	} else {
		return [0, 0];
	}
}

// 数値を受け取り、1の場合は「元」を、それ以外の場合はその数値を文字列として返す
function _regularizeNen(i) {
	return (i == 1) ? '元' : String(i);
}

// 和暦構造体から和暦文字列を返す
function jFormat(p) {
	const betaArea = (p['元号B'] != '') ? `（${p['元号B']}${_regularizeNen(p['年B'])}年）` : '';
	const uruu = (p['閏'] == true) ? '閏' : '';
//	return "${p['元号A']}${_regularizeNen(p['年A'])}年${betaArea} ${uruu}${p['月']}月${p['日']}日";
	if (p['元号A'] != '') {
		return p['元号A'] + _regularizeNen(p['年A']) + "年" + betaArea + uruu +
			String(p['月']) + "月" + String(p['日']) + "日";
	} else {
		return '';
	}
}

// 元号、年から年の情報を返す（ヘッダ、月の大小、月干支）
function getCalendarForTheYear(gengou, nen) {
	if (gengou in eraDict) {
		const gengouData = eraDict[gengou] ?? [0, 0, 0];
		const startYear = gengouData[0] + nen - 1;
		if (startYear <= _endYear) {
			return getJYearInfo(startYear);
		} else {
			return GregorianCalendar.info(startYear);
		}
	} else {
		return [];
	}
}

// 和暦年から年の情報を返す
// （getCalendarForTheYearのサブロジック）
function getJYearInfo(year) {
	const data = _lunisolarArray[year - _startYear];
	const uruuMonth = (data[0] == 0) ? 13 : data[0];
	const monthData = data[1];
	let header = [];
	let stemBranch = [];

	for(let i = 1; i < uruuMonth; i++) {
		header.push(_monthName(i));
		stemBranch.push(CyclicCalendar.getStemBranchFromNenTsuki(year, i));
	}
	if (uruuMonth != 13) {
		header.push(_monthName(uruuMonth));
		stemBranch.push(CyclicCalendar.getStemBranchFromNenTsuki(year, uruuMonth));
		header.push(`閏${_monthName(uruuMonth)}`);
		stemBranch.push(CyclicCalendar.getStemBranchFromNenTsuki(year, uruuMonth));
		for (let i = uruuMonth+1; i < 13; i++) {
			header.push(_monthName(i));
			stemBranch.push(CyclicCalendar.getStemBranchFromNenTsuki(year, i));
		}
	}
	return [header, monthData, stemBranch];
}


// 4桁年から年の情報を返す
function infoFor(year) {
	if ((year < _startYear) || (year > _endYear)) {
		return '';
	}
	const monthName = ['', '正月', '二月', '三月', '四月', '五月',
		'六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
	const record = jcalendar[year] ?? [];
	if (record == []) {
		throw Exception();
	}
	const leapMonth = record[0];
	const startJDofMonth = record[1];
	const daysOfMonth = record[2];
	let result = '';
	let mno = 1;
	let leapOffset = 0;
	let leap = '　';
	for (let m of daysOfMonth) {
		result += `${leap}${monthName[mno - leapOffset]}(${String(m)}:${String(startJDofMonth[mno-1])})\n`;
		if (leapMonth == mno) {
			leap = '閏';
			leapOffset = 1;
		} else {
			leap = '　';
		}
		mno += 1;
	}
	return result;
}

// テーブルとtargetから、降順で対象データへのインデックスを返す
function _reverseSearch(target, table) {
	let i = table.length - 1;
	while (table[i] > target) {
		i -= 1;
	}
	return i;
}

// ユリウス通日から和暦の4桁年を返す
function getLunisolarYear(jd) {
	if ((jd < _startJD) || (jd > _endJD)) {   // Range check
		return 0;
	}
	const i = _reverseSearch(jd, jdtable);
	const year = _startYear + i;
	return year;
}

// ユリウス通日から和暦構造体を返す
function getLunisolarCalendar(jd) {
	const year = getLunisolarYear(jd);
	if (year == 0) {
		return {};
	}
	const jcal = jcalendar[year] ?? [];
	if (jcal == []) {
		throw Exception();
	}
	let leap = jcal[0];
	const monthjd = jcal[1];
	const i = _reverseSearch(jd, monthjd);
	const day = jd - monthjd[i] + 1;

	let leapFlag = false;
	let month = i;
	if (leap == 0) {
		leap = 13;
	}
	if (i == leap) {
		leapFlag = true;
		month = i;
	} else if (i < leap) {
		month = i + 1;
	} else {
		month = i;
	}
	return {
		'年': year,
		'閏': leapFlag,
		'月': month,
		'日': day
	};
}

// 月から月名を返す
function _monthName(i) {
	if (i == 1) {
		return "正月";
	} else {
		return `${String(i)}月`;
	}
}
