class GlobalManager {
	constructor() {
		this.inputType = document.getElementById("INPUTTYPE");
		this.gengou = document.getElementById("GENGOU");
		this.nen = document.getElementById("NEN");
		this.uruu = document.getElementById("URUU");
		this.tsuki = document.getElementById("TSUKI");
		this.hi = document.getElementById("HI");
		this.outArea = document.getElementById("OUTAREA");
		this.inputType.addEventListener('change', (evt) => {
			if (this.inputType.value === 'WAREKI') {
				this.gengou.disabled = false;
				this.nen.disabled = false;
				this.uruu.disabled = false;
				this.tsuki.disabled = false;
			} else {
				this.gengou.disabled = true;
				this.gengou.value = '';
				this.nen.disabled = false;
				this.uruu.disabled = true;
				this.uruu.checked = false;
				this.tsuki.disabled = false;
			}
		});
	}
}
const G = new GlobalManager();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let TableSize = urlParams.get('size') ?? 15;
TableSize = Number(TableSize);

G.inputType.addEventListener('change', (evt) => {
	while (G.outArea.firstChild) {
		G.outArea.removeChild(G.outArea.lastChild);
	}
	if (G.inputType.selectedIndex === 0) {
		makeRoloIndex();
	}
});

G.nen.addEventListener('focus', (evt) => {
	G.nen.select();
});

G.nen.addEventListener('keydown', (evt) => {
	if (evt.key === 'Enter') {
		G.tsuki.focus();
	}
});

G.tsuki.addEventListener('change', (evt) => {
	G.hi.focus();
});

G.tsuki.addEventListener('keydown', (evt) => {
	switch (evt.key) {
		case 'Enter' : G.hi.focus(); break;
		case '0' : G.tsuki.selectedIndex = 0; break;
		case '1' : G.tsuki.selectedIndex = 1; break;
		case '2' : G.tsuki.selectedIndex = 2; break;
		case '3' : G.tsuki.selectedIndex = 3; break;
		case '4' : G.tsuki.selectedIndex = 4; break;
		case '5' : G.tsuki.selectedIndex = 5; break;
		case '6' : G.tsuki.selectedIndex = 6; break;
		case '7' : G.tsuki.selectedIndex = 7; break;
		case '8' : G.tsuki.selectedIndex = 8; break;
		case '9' : G.tsuki.selectedIndex = 9; break;
		case 'a' : case 'A' : G.tsuki.selectedIndex = 10; break;
		case 'b' : case 'B' : G.tsuki.selectedIndex = 11; break;
		case 'c' : case 'C' : G.tsuki.selectedIndex = 12; break;
		default :
	}
	evt.preventDefault();
});

G.hi.addEventListener('focus', (evt) => {
	G.hi.select();
});

G.hi.addEventListener('keydown', (evt) => {
	if (evt.key === 'Enter') go();
});

function go() {
	let gengou = '';
	let nen = 0;
	let uruu = false;
	let tsuki = 0;
	let hi = '';
	let julianday = 0;
	switch (G.inputType.value) {
		case 'WAREKI' :
			gengou = G.gengou.value;
			if (!(gengou in eraDict)) {	// 無効な元号は最新の元号を使用する
				gengou = _eraArray[_eraArray.length-1][0];
				G.gengou.value = gengou;
			}
			nen = (G.nen.value === '元年') ? 1 : Number(G.nen.value);
			if (nen === 0) {
				G.nen.value = 1;
				nen = 1;
			}
			uruu = G.uruu.checked;
			tsuki = Number(G.tsuki.value);
			if (tsuki === 0) {
				outputYearInformation(gengou, nen);
				return;
			}
			hi = Number(G.hi.value);
			if (hi === 0) {
				G.hi.value = 1;
				hi = 1;
			}
			julianday = getJulianDay(gengou, nen, uruu, tsuki, hi);
			if (julianday !== 0) {
				makeMultipleCalendars(julianday, TableSize);
			} else {
				alert('閏月ではありません。');
			}
			break;
		case 'GREGORIAN' :
			nen = Number(G.nen.value);
			tsuki = Number(G.tsuki.value);
			hi = Number(G.hi.value);
			julianday = GregorianCalendar.toJulianDay(true, nen, tsuki, hi);
			const gout = GregorianCalendar.format(GregorianCalendar.toGregorianCalendar(julianday));
			makeMultipleCalendars(julianday, TableSize);
			break;
		case 'JULIAN' :
			nen = Number(G.nen.value);
			tsuki = Number(G.tsuki.value);
			hi = Number(G.hi.value);
			julianday = JulianCalendar.toJulianDay(nen, tsuki, hi);
			const jout = JulianCalendar.format(JulianCalendar.toJulianCalendar(julianday));
			makeMultipleCalendars(julianday, TableSize);
			break;
		default :
			console.log(`？？？${G.inputType.value}`);
	}
}

makeRoloIndex();

// 元号選択初期画面を作成・表示する
function makeRoloIndex(outArea) {
	G.gengou.value = '';
	const dict = {};
	for (let i = 0; i < _eraArray.length; i++) {
		let yomiSubarray = _eraArray[i][1].split(/、/);
		if (yomiSubarray.length === 0) continue;
		for (let yomi of yomiSubarray) {
			dict[yomi] ||= '';
			dict[yomi] += `${_eraArray[i][0]}:${String(i)},`; 
		}
	}
	dict['んん'] = 'んん:99999,';		// Sentinel
	let breakKey = 'あ';
	G.outArea.innerHTML = '';
	const tableElement = document.createElement('table');
	tableElement.border = '1px solid black';;
	G.outArea.appendChild(tableElement);
	const tblColMax = 5;
	let tblCounter = tblColMax;
	let row, cell;
	internalDict = {};
	let workArea = '';
	for (let yomi of Object.keys(dict).sort()) {
		if (yomi === '')  continue;
		const infoIdx = dict[yomi].split(/,/);
		infoIdx.pop();
		for (let tuple of infoIdx) {
			const kp = tuple.split(/:/);
			const firstCh = yomi.substring(0, 1);
			if (firstCh !== breakKey) {
				internalDict[breakKey] = workArea;
				if (++tblCounter >= tblColMax) {
					row = tableElement.insertRow();
					tblCounter = 0;
				}
				cell = row.insertCell();
				cell.innerHTML = `<a href="javascript:anchorLink('${workArea}');">${breakKey}</a>`;
				breakKey = firstCh;
				workArea = '';
			}
			workArea += `${kp[0]}（${yomi}）:${kp[1]},`;
		}
	}
}

// 元号選択初期画面上のリンクをクリックした際の処理
function anchorLink(nameIdxArray) {
	while (G.outArea.firstChild) {
		G.outArea.removeChild(G.outArea.lastChild);
	}
	const btn = document.createElement('button');
	btn.onclick = makeRoloIndex;
	btn.innerHTML = '元号選択初期画面を表示';
	G.outArea.appendChild(btn);
	
	const tableElement = document.createElement('table');
	tableElement.border = '1px solid black';;
	G.outArea.appendChild(tableElement);
	const arr = nameIdxArray.split(/,/);
	arr.pop();
	const tblColMax = 1;
	let tblCounter = tblColMax;
	for (let tuple of arr) {
		const name = tuple.split(/:/)[0];
		if (++tblCounter >= tblColMax) {
			row = tableElement.insertRow();
			tblCounter = 0;
		}
		cell = row.insertCell();
		cell.innerHTML = `<a href="javascript:setGengou('${name}');">${name}</a>`;
	}
}

function setGengou(gengou) {
	const gengouKanji = gengou.replace(/（.+）/, '');
	G.gengou.value = gengouKanji;
	while (G.outArea.firstChild) {
		G.outArea.removeChild(G.outArea.lastChild);
	}
	const btn = document.createElement('button');
	btn.onclick = makeRoloIndex;
	btn.innerHTML = '元号選択初期画面を表示';
	G.outArea.appendChild(btn);
	G.inputType.selectedIndex = 0;
	G.nen.select();
	G.nen.focus();
}


function makeMultipleCalendars(startJD, size) {
	while (G.outArea.firstChild) {
		G.outArea.removeChild(G.outArea.lastChild);
	}
	const btn = document.createElement('button');
	btn.onclick = makeRoloIndex;
	btn.innerHTML = '元号選択初期画面を表示';
	G.outArea.appendChild(btn);

	const tableElement = document.createElement('table');
	tableElement.border = '1px solid black';
	G.outArea.appendChild(tableElement);
	createHeader(tableElement);
	let jd = startJD - size;
	const endJD = startJD + size;
	while(jd <= endJD) {
		const row = tableElement.insertRow();
		if (jd === startJD) {
			row.style.backgroundColor = '#ccccff';
		}
		let cell = row.insertCell();
		cell.innerHTML = jd;
		cell = row.insertCell();
		const w = getJapaneseDate(jd);
		cell.innerHTML = mergedJFormat(w);

		let lsc = getLunisolarCalendar(jd);
		if (Object.keys(lsc).length === 0) {
			if (GregorianCalendar.isProleptic(jd)) {
				const jc = JulianCalendar.toJulianCalendar(jd);
				if (jc['AD']) {
					cell = row.insertCell();
					cell.innerHTML = CyclicCalendar.getStemBranchFromNen(jc['year']);
					cell = row.insertCell();
					cell.innerHTML = CyclicCalendar.getStemBranchFromNenTsuki(jc['year'], jc['month']);
				} else {
					cell = row.insertCell();
					cell.innerHTML = '−';
					cell = row.insertCell();
					cell.innerHTML = '−';
				}
			} else {
				const gc = GregorianCalendar.toGregorianCalendar(jd);
				cell = row.insertCell();
				cell.innerHTML = CyclicCalendar.getStemBranchFromNen(gc['year']);
				cell = row.insertCell();
				cell.innerHTML = CyclicCalendar.getStemBranchFromNenTsuki(gc['year'], gc['month']);
			}
		} else {
			cell = row.insertCell();
			cell.innerHTML = CyclicCalendar.getStemBranchFromNen(lsc['年']);
			cell = row.insertCell();
			cell.innerHTML = CyclicCalendar.getStemBranchFromNenTsuki(lsc['年'], lsc['月']);
		}
		cell = row.insertCell();
		cell.innerHTML = CyclicCalendar.getStemBranchFromJulianDay(jd);

		cell = row.insertCell();
		if (GregorianCalendar.isProleptic(jd)) {
			cell.style.color = '#FF0000';
		}
		cell.innerHTML = GregorianCalendar.format(GregorianCalendar.toGregorianCalendar(jd));
		cell = row.insertCell();
		cell.innerHTML = JulianCalendar.format(JulianCalendar.toJulianCalendar(jd));
		cell = row.insertCell();
		cell.innerHTML = CyclicCalendar.getWeekOfTheDay(jd);
		jd++;
		size--;
	}
}

function createHeader(te) {
	const row = document.createElement('tr');
	let th;
	th = document.createElement('th');
	th.innerHTML = 'ユリウス通日';
	row.appendChild(th);
	th = document.createElement('th');
	th.innerHTML = '和暦';
	row.appendChild(th);
	th = document.createElement('th');
	th.innerHTML = '年干支';
	row.appendChild(th);
	th = document.createElement('th');
	th.innerHTML = '月干支<br>(暦月)';
	row.appendChild(th);
	th = document.createElement('th');
	th.innerHTML = '日干支';
	row.appendChild(th);
	th = document.createElement('th');
	th.innerHTML = 'グレゴリオ暦<br>（<span style="color: red">赤字</span>は先発）';
	row.appendChild(th);
	th = document.createElement('th');
	th.innerHTML = 'ユリウス暦';
	row.appendChild(th);
	th = document.createElement('th');
	th.innerHTML = '曜日';
	row.appendChild(th);
	te.appendChild(row);
}

function mergedJFormat(jcArray) {
	let reel = '';
	let separator = '';
	for (const ww of jcArray) {
		if (Object.keys(ww).length > 0) {
			reel += separator + jFormat(ww);
			separator = '<br>'
		}
	}
	if (reel === '') {
		reel = '−';
	}
	return reel;
}

function outputYearInformation(gengou, nen) {
	while (G.outArea.firstChild) {
		G.outArea.removeChild(G.outArea.lastChild);
	}
	const btn = document.createElement('button');
	btn.onclick = makeRoloIndex;
	btn.innerHTML = '元号選択初期画面を表示';
	G.outArea.appendChild(btn);

	const divHead = document.createElement('div');
	divHead.innerHTML = `${gengou}`;
	G.outArea.appendChild(divHead);
	const startEnd = eraDict[gengou];
	const miniTable = document.createElement('table');
	miniTable.border = '1px solid black';
	const row = miniTable.insertRow();
	row.insertCell().innerHTML = mergedJFormat(getJapaneseDate(startEnd[1]));
	row.insertCell().innerHTML = '→';
	row.insertCell().innerHTML = mergedJFormat(getJapaneseDate(startEnd[2]));
	G.outArea.appendChild(miniTable);

	const div2 = document.createElement('div');
	div2.innerHTML = `${gengou}${_regularizeNen(nen)}年`;
	G.outArea.appendChild(div2);

	const tableElement = document.createElement('table');
	tableElement.border = '1px solid black';
	G.outArea.appendChild(tableElement);

	const mInfo = getCalendarForTheYear(gengou, nen);
	let result = '';
	for (let i = 0; i < mInfo[0].length; i++) {
		const row = tableElement.insertRow();
		let cell = row.insertCell();
		cell.innerHTML = mInfo[0][i];
		cell = row.insertCell();
		cell.innerHTML = mInfo[1][i];
		cell = row.insertCell();
		cell.innerHTML = mInfo[2][i];
	}
}
