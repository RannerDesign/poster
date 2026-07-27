/*
	poster.js
	Poster Generator

	The MIT License (MIT)

	Copyright (c) 2014-2026 RannerDesign

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
    const program_name = 'Poster Generator';
	const program_version = '3.1.6';
    const program_date = '2026-07-27';

	var AUX, EL, P, LOG;

//	============================================================
//	Initialization
//	============================================================
	document.addEventListener('DOMContentLoaded', () => {
		AUX = new auxiliaryHelpers();
		P = {};
		EL = {};
		LOG = true;												// Enable console.log output
		P.OS = getClientOS();
		P.programVersion = program_name + ' v' + program_version;
		P.lang = navigator.language.split('-')[0];
		P.fonts = {};
		P.fonts.currentFontFamilies = prepareDefaultFonts();
		P.fonts.mode = 'default';
		P.fonts.allFontsAvailable = 'queryLocalFonts' in window;
		P.messages = new language_support({lang: P.lang}, setupLanguageTextElements());
		buildPage();
		loadLanguageText();
		presetElements();
		defineWaitCounters();
		P.res = loadResources();
		P.RT = new runtime_measurement({console: true});
		P.log = new logmessage_manager(EL.messagearea, {timeout: 60, console: true, messages: msgkey => {return P.messages.getmsg(msgkey);}});
		P.uploader = new dnd_file_uploader(EL.uploadfilearea, EL.imgfile, loadImage);
		P.bguploader = new dnd_file_uploader(EL.uploadfilearea8, EL.bgimgfile, loadBGimage);
		P.timeout = 500;
		clearData();

		P.log.write(P.programVersion + ' on ' + P.OS, 'msginfo');
	});
//	============================================================
//	Page setup
//	============================================================
	function buildPage() {
		const tsoptions1 = prepareToggleSwitch({divCSS: 'justify-self: center;'});
		
		EL = {};
		EL.container = createChild('body', 'div', 'container');
		EL.h0 = createChild(EL.container, 'h2', {langkey: ''});
		EL.d0 = createChild(EL.container, 'div', 'topright');
		EL.d1 = createChild(EL.d0, 'div');
		EL.a1 = createChild(EL.d1, 'a', {href: P.lang == 'de' ? 'poster_help_de.html' : 'poster_help_en.html', target: '_blank', class: 'helpbutton', langkey: ''});
		EL.d2 = createChild(EL.d0, 'div');
		EL.l_language = createChild(EL.d2, 'div', {style: 'font-size: 12px;', langkey: ''});
		EL.language = createChild(EL.d2, 'select', {name: 'language'});
		EL.language.addEventListener('change', changeLanguage);
		createChild(EL.language, 'option', {value: ''});
		P.messages.options.supportedLanguages.forEach((lang) => {
			createChild(EL.language, 'option', '', lang);
		});

//		Section1: Load images
		EL.h2 = createChild(EL.container, 'h4', {langkey: ''});
		EL.c1 = createChild(EL.container, 'div', 'flexblocks');
		EL.uploadfilearea = createChild(EL.c1, 'div', 'uploadfilearea');
		EL.c2 = createChild(EL.uploadfilearea, 'div', 'droparea');
		EL.j1 = createChild(EL.c2, 'label', {for: 'imgfile', langkey: ''});
		EL.imgfile = createChild(EL.c2, 'input', {type: 'file', id: 'imgfile', style: 'display: none', multiple: true});
		EL.waiticon = createChild(EL.c1, 'div', 'waiticon');
		EL.waitcount = createChild(EL.c1, 'div', 'counter');
		EL.b3 = createChild(EL.c1, 'button', {type: 'button', langkey: ''});
		EL.b3.addEventListener('click', clearData);

//		Section2: Poster Type
		EL.h3 = createChild(EL.container, 'h4', {langkey: ''});
		EL.c3 = createChild(EL.container, 'div', 'flexblocks');
		EL.pt1 = createChild(EL.c3, 'button', {type: 'button', langkey: ''});
		EL.pt1.addEventListener('click', () => setPosterType(1));
		EL.pt2 = createChild(EL.c3, 'button', {type: 'button', langkey: ''});
		EL.pt2.addEventListener('click', () => setPosterType(2));
		EL.pt3 = createChild(EL.c3, 'button', {type: 'button', langkey: ''});
		EL.pt3.addEventListener('click', () => setPosterType(3));
		
//		Section 3: Output format
		EL.h4 = createChild(EL.container, 'h4', {langkey: ''});
		EL.c4 = createChild(EL.container, 'div', 'flexblocks');
		EL.ot1 = createChild(EL.c4, 'button', {type: 'button', langkey: ''});
		EL.ot1.addEventListener('click', () => setOutputType(1));
		EL.ot2 = createChild(EL.c4, 'button', {type: 'button', langkey: ''});
		EL.ot2.addEventListener('click', () => setOutputType(2));

//		Section 4: Poster Parameters
		EL.h5 = createChild(EL.container, 'h4', {langkey: ''});

//		pp1
		EL.pp1 = createChild(EL.container, 'div');
		EL.g1 = createChild(EL.pp1, 'div', 'grid2');
		EL.colcount1 = createChild(EL.g1, 'input', {type: 'text'});
		EL.l_colcount1 = createChild(EL.g1, 'label', {langkey: ''});
		EL.rowcount1 = createChild(EL.g1, 'input', {type: 'text'});
		EL.l_rowcount1 = createChild(EL.g1, 'label', {langkey: ''});
		EL.singleWidth1 = createChild(EL.g1, 'input', {type: 'text'});
		EL.l_singleWidth1 = createChild(EL.g1, 'label', {langkey: ''});
		EL.singleHeight1 = createChild(EL.g1, 'input', {type: 'text'});
		EL.l_singleHeight1 = createChild(EL.g1, 'label', {langkey: ''});
		EL.aspect1 = createChild(EL.g1, 'input', {type: 'text'});
		EL.l_aspect1 = createChild(EL.g1, 'label', {langkey: ''});
		createChild(EL.g1, 'div');
		EL.l_crop1 = createChild(EL.g1, 'label', {langkey: ''});
		EL.fit11 = createChild(EL.g1, 'input', {id: 'fit11', name: 'fit1', type: 'radio', value: 'contain'});
		EL.l_fit11 = createChild(EL.g1, 'label', {for: 'fit11', langkey: ''});
		EL.fit12 = createChild(EL.g1, 'input', {id: 'fit12', name: 'fit1', type: 'radio', value: 'fill'});
		EL.l_fit12 = createChild(EL.g1, 'label', {for: 'fit12', langkey: ''});
		EL.fit13 = createChild(EL.g1, 'input', {id: 'fit13', name: 'fit1', type: 'radio', value: 'cover'});
		EL.l_fit13 = createChild(EL.g1, 'label', {for: 'fit13', langkey: ''});

//		pp2
		EL.pp2 = createChild(EL.container, 'div');
		EL.g2 = createChild(EL.pp2, 'div', 'grid2');
		EL.targetWidth2 = createChild(EL.g2, 'input', {type: 'text'});
		EL.l_targetWidth2 = createChild(EL.g2, 'label', {langkey: ''});
		EL.targetHeight2 = createChild(EL.g2, 'input', {type: 'text'});
		EL.l_targetHeight2 = createChild(EL.g2, 'label', {langkey: ''});
		EL.rowcount2 = createChild(EL.g2, 'input', {type: 'text'});
		EL.l_rowcount2 = createChild(EL.g2, 'label', {langkey: ''});
		EL.rowgrid2 = createChild(EL.g2, 'input', {type: 'text'});
		EL.l_rowgrid2 = createChild(EL.g2, 'label', {langkey: ''});

//		pp3
		EL.pp3 = createChild(EL.container, 'div');
		EL.g3 = createChild(EL.pp3, 'div', 'grid2');
		EL.targetHeight3 = createChild(EL.g3, 'input', {type: 'text'});
		EL.l_targetHeight3 = createChild(EL.g3, 'label', {langkey: ''});
		EL.targetWidth3 = createChild(EL.g3, 'input', {type: 'text'});
		EL.l_targetWidth3 = createChild(EL.g3, 'label', {langkey: ''});
		EL.colcount3 = createChild(EL.g3, 'input', {type: 'text'});
		EL.l_colcount3 = createChild(EL.g3, 'label', {langkey: ''});
		EL.colgrid3 = createChild(EL.g3, 'input', {type: 'text'});
		EL.l_colgrid3 = createChild(EL.g3, 'label', {langkey: ''});

//		pp0
		EL.pp0 = createChild(EL.container, 'div');
		EL.g0 = createChild(EL.pp0, 'div', 'grid2');
		EL.margins = createChild(EL.g0, 'input', {type: 'text'});
		EL.l_margins = createChild(EL.g0, 'label', {langkey: ''});
		EL.gaps = createChild(EL.g0, 'input', {type: 'text'});
		EL.l_gaps = createChild(EL.g0, 'label', {langkey: ''});
		EL.bgcol = createChild(EL.g0, 'input', {type: 'color'});
		EL.l_bgcol = createChild(EL.g0, 'label', {langkey: ''});
		EL.bgimg = buildToggleSwitch(EL.g0, tsoptions1);
		EL.l_bgimg = createChild(EL.g0, 'label', {langkey: ''});
		EL.bgimg.addEventListener('change', toggleBackgroundImage);
		EL.imcap = buildToggleSwitch(EL.g0, tsoptions1);
		EL.l_imcap = createChild(EL.g0, 'label', {langkey: ''});
		EL.imcap.addEventListener('change', toggleImageTitles);
		createChild(EL.g0, 'div');
		EL.l_singleimage = createChild(EL.g0, 'label', {langkey: ''});
		EL.borderwidth = createChild(EL.g0, 'input', {type: 'text'});
		EL.l_borderwidth = createChild(EL.g0, 'label', {langkey: ''});
		EL.borderdash = createChild(EL.g0, 'input', {type: 'text', class: 'modeCanvas'});
		EL.l_borderdash = createChild(EL.g0, 'label', {class: 'modeCanvas', langkey: ''});
		EL.borderstyle = createChild(EL.g0, 'select', {name: 'borderstyle', class: 'modeHTML'});
		EL.borderstyle1 = createChild(EL.borderstyle, 'option', {value: '', langkey: ''});
		EL.borderstyle2 = createChild(EL.borderstyle, 'option', {value: 'solid', langkey: ''});
		EL.borderstyle3 = createChild(EL.borderstyle, 'option', {value: 'dotted', langkey: ''});
		EL.borderstyle4 = createChild(EL.borderstyle, 'option', {value: 'dashed', langkey: ''});
		EL.borderstyle5 = createChild(EL.borderstyle, 'option', {value: 'double', langkey: ''});
		EL.borderstyle6 = createChild(EL.borderstyle, 'option', {value: 'groove', langkey: ''});
		EL.borderstyle7 = createChild(EL.borderstyle, 'option', {value: 'ridge', langkey: ''});
		EL.borderstyle8 = createChild(EL.borderstyle, 'option', {value: 'inset', langkey: ''});
		EL.borderstyle9 = createChild(EL.borderstyle, 'option', {value: 'outset', langkey: ''});
		EL.l_borderstyle = createChild(EL.g0, 'label', {class: 'modeHTML', langkey: ''});
		EL.bordercolor = createChild(EL.g0, 'input', {type: 'color'});
		EL.l_bordercolor = createChild(EL.g0, 'label', {langkey: ''});
		EL.corner = createChild(EL.g0, 'input', {type: 'text'});
		EL.l_corner = createChild(EL.g0, 'label', {langkey: ''});
		EL.postername = createChild(EL.g0, 'input', {type: 'text'});
		EL.l_postername = createChild(EL.g0, 'label', {langkey: ''});
		EL.filetype = createChild(EL.g0, 'select', {name: 'filetype', class: 'center bold'});
		buildSelectOptions(EL.filetype, ['jpg', 'png']);
		EL.l_filetype = createChild(EL.g0, 'label', {langkey: ''});
		EL.quality = createChild(EL.g0, 'input', {type: 'text'});
		EL.l_quality = createChild(EL.g0, 'label', {langkey: ''});

//		pp8: Background image
		EL.pp8 = createChild(EL.container, 'div', {class: 'optarea', style: 'display: none;'});
		EL.h8 = createChild(EL.pp8, 'h4', {langkey: 'l_bgimg'});
		EL.c8 = createChild(EL.pp8, 'div', 'flexblocks');
		EL.uploadfilearea8 = createChild(EL.c8, 'div', 'uploadfilearea');
		EL.c81 = createChild(EL.uploadfilearea8, 'div', 'droparea');
		EL.j81 = createChild(EL.c81, 'label', {for: 'bgimgfile', langkey: ''});
		EL.bgimgfile = createChild(EL.c81, 'input', {type: 'file', id: 'bgimgfile', style: 'display: none', multiple: false});
		EL.c82 = createChild(EL.c8, 'div', 'bgthumb');
		EL.c83 = createChild(EL.c8, 'div', 'bgmeta');
		EL.g8 = createChild(EL.pp8, 'div', 'grid2');
		EL.bgimgtransform = createChild(EL.g8, 'select', {name: 'bgimgtransform'});
		EL.bgimgtransform1 = createChild(EL.bgimgtransform, 'option', {value: 'contain', langkey: ''});
		EL.bgimgtransform2 = createChild(EL.bgimgtransform, 'option', {value: 'fill', langkey: ''});
		EL.bgimgtransform3 = createChild(EL.bgimgtransform, 'option', {value: 'cover', langkey: ''});
		EL.l_bgimgtransform = createChild(EL.g8, 'label', {langkey: ''});
		EL.bgimgpos = createChild(EL.g8, 'input', {type: 'text'});
		EL.l_bgimgpos = createChild(EL.g8, 'label', {langkey: ''});
		EL.bgimgopacity = createChild(EL.g8, 'input', {type: 'text'});
		EL.l_bgimgopacity = createChild(EL.g8, 'label', {langkey: ''});

//		pp9: Image captions
		EL.pp9 = createChild(EL.container, 'div', {class: 'optarea', style: 'display: none;'});
		EL.h9 = createChild(EL.pp9, 'h4', {langkey: 'l_imcap'});
		EL.g9 = createChild(EL.pp9, 'div', 'grid2');
		EL.titlefontfamily = createChild(EL.g9, 'select', {name: 'titlefontfamily'});
		prepareFontSelection();
		if (P.fonts.allFontsAvailable) {
			EL.c9 = createChild(EL.g9, 'div');
			EL.l_titlefontfamily = createChild(EL.c9, 'label', {langkey: ''});
			EL.togglefont = createChild(EL.c9, 'label', {class: 'togglefont', langkey: 'fontmodedefault'});
			EL.togglefont.addEventListener('click', toggleFontMode);
		} else {
			EL.l_titlefontfamily = createChild(EL.g9, 'label', {langkey: ''});
		}
		EL.titlefontsize = createChild(EL.g9, 'input', {type: 'text'});
		EL.l_titlefontsize = createChild(EL.g9, 'label', {langkey: ''});
		EL.titlecolor = createChild(EL.g9, 'input', {type: 'color'});
		EL.l_titlecolor = createChild(EL.g9, 'label', {langkey: ''});
		EL.titlecolorstroke = createChild(EL.g9, 'input', {type: 'color'});
		EL.l_titlecolorstroke = createChild(EL.g9, 'label', {langkey: ''});
		EL.titlestrokewidth = createChild(EL.g9, 'input', {type: 'text'});
		EL.l_titlestrokewidth = createChild(EL.g9, 'label', {langkey: ''});
		EL.titleusefilename = buildToggleSwitch(EL.g9, tsoptions1);
		EL.l_titleusefilename = createChild(EL.g9, 'label', {langkey: ''});
		createChild(EL.g9, 'div');
		EL.l_titlepos = createChild(EL.g9, 'label', {langkey: ''});
		EL.titleimageanchor = createChild(EL.g9, 'input', {type: 'text'});
		EL.l_titleimageanchor = createChild(EL.g9, 'label', {langkey: ''});
		EL.titletextanchor = createChild(EL.g9, 'input', {type: 'text'});
		EL.l_titletextanchor = createChild(EL.g9, 'label', {langkey: ''});
		EL.titledistances = createChild(EL.g9, 'input', {type: 'text'});
		EL.l_titledistances = createChild(EL.g9, 'label', {langkey: ''});
		EL.titleangle = createChild(EL.g9, 'input', {type: 'text'});
		EL.l_titleangle = createChild(EL.g9, 'label', {langkey: ''});

//		Section 5: Generate Poster
		EL.h6 = createChild(EL.container, 'h4', {langkey: ''});
		EL.c6 = createChild(EL.container, 'div', 'flexblocks');
		EL.pw2 = createChild(EL.c6, 'button', {type: 'button', langkey: ''});
		EL.pw2.addEventListener('click', makePoster);
		EL.waitcanvas = createChild(EL.c6, 'div', 'waiticon');
		EL.pw4 = createChild(EL.c6, 'div');

//		Containers at the end
		EL.version = createChild(EL.container, 'div', 'programversion');
		EL.version.addEventListener('click', toggleDebugInfo);
		EL.messagearea = createChild(EL.container, 'div', 'messagearea');
		EL.inputlist = createChild(EL.container, 'div', 'inputlist');
		EL.filelist = createChild(EL.container, 'div', 'filelist');
		EL.debuginfo = createChild(EL.container, 'div', 'debuginfo');
	}

	function loadLanguageText() {
		for (const [name, ele] of Object.entries(EL)) {
			try {
				if (ele.hasAttribute('langkey')) {
					if (ele.getAttribute('langkey') == '') {
						ele.innerHTML = P.messages.getmsg(name);
					} else {
						ele.innerHTML = P.messages.getmsg(ele.getAttribute('langkey'));
					}
				}
			} catch(error) {
				console.warn('loadLanguageText failure:', error);
				console.log('loadLanguageText - name, ele:', name, ele);
			}
		}
	}

	function changeLanguage() {
		if (EL.language.value) {
			P.messages.setLanguage(EL.language.value);
			loadLanguageText();
			EL.a1.href = P.messages.options.lang == 'de' ? 'poster_help_de.html' : 'poster_help_en.html';
		}
	}

	function prepareFontSelection() {
		EL.titlefontfamily.innerHTML = '';
		EL.titlefontfamily0 = createChild(EL.titlefontfamily, 'option', {value: '', langkey: ''}, P.messages.getmsg('titlefontfamily0'));
		buildSelectOptions(EL.titlefontfamily, P.fonts.currentFontFamilies);
	}

	function prepareDefaultFonts() {
		return [
			"Arial",
			"Verdana",
			"Times New Roman",
			"Georgia",
			"Courier New",
			"Trebuchet MS",
			"Tahoma",
			"Comic Sans MS",
			"sans-serif",
			"serif",
			"monospace"
		];
	}

	async function toggleFontMode() {
		if (P.fonts.mode == 'default') {
			try {
				P.fonts.localFonts = await window.queryLocalFonts();
				P.fonts.currentFontFamilies = [...new Set(P.fonts.localFonts.map(f => f.family))].sort();
				P.fonts.mode = 'allfonts';
				EL.togglefont.innerHTML = P.messages.getmsg('fontmodeall');
				prepareFontSelection();
			} catch (err) {
				console.warn('queryLocalFonts available but local font access failed:', err);
			}
		} else {
			P.fonts.currentFontFamilies = prepareDefaultFonts();
			P.fonts.mode = 'default';
			EL.togglefont.innerHTML = P.messages.getmsg('fontmodedefault');
			prepareFontSelection();
		}
	}

	function presetElements() {
		EL.version.innerHTML = P.programVersion;
		setPosterType(1);
		setOutputType(1);

		EL.colcount1.value = '';
		EL.rowcount1.value = '';
		EL.singleWidth1.value = 240;
		EL.singleHeight1.value = '';
		EL.aspect1.value = '';
		EL.fit11.checked = true;

		EL.targetWidth2.value = 1440;
		EL.targetHeight2.value = 960;
		EL.rowcount2.value = '';
		EL.rowgrid2.value = '';

		EL.targetHeight3.value = 1440;
		EL.targetWidth3.value = 960;
		EL.colcount3.value = '';
		EL.colgrid3.value = '';

		EL.margins.value = '10';
		EL.gaps.value = '5';
		EL.bgcol.value = '#4f4f4f';
		EL.borderwidth.value = '';
		EL.borderstyle.value = '';
		EL.bordercolor.value = '#000000';
		EL.corner.value = '';
		EL.filetype.value = ['iOS', 'iPadOS'].includes(P.OS) ? 'png' : 'jpg'; 

		hideElements(EL.g8);
		EL.bgimgpos.value = 'CM';
		EL.bgimgopacity.value = '1';

		EL.titlefontfamily.value = 'sans-serif';
		EL.titlefontsize.value = '16';
		EL.titlecolor.value = '#000000';
		EL.titlecolorstroke.value = '#7f7f7f';
		EL.titlestrokewidth.value = '3';
		EL.titleimageanchor.value = validateUserInput('position', 'CB')[0];
		EL.titletextanchor.value = validateUserInput('position', 'CT')[0];
	}

	function toggleBackgroundImage() {
		EL.pp8.style.display = EL.bgimg.checked ? 'block' : 'none';
	}

	function toggleImageTitles() {
		EL.pp9.style.display = EL.imcap.checked ? 'block' : 'none';
	}

	function toggleDebugInfo() {
		if (EL.debuginfo.innerHTML == '') {
			createChild(EL.debuginfo, 'h2', '', 'Debug Information');
			createChild(EL.debuginfo, 'h4', '', 'Navigator');
			createChild(EL.debuginfo, 'pre', '', JSON.stringify(dumpVavigatorSelected(), null, 2));
		} else {
			EL.debuginfo.innerHTML = '';
		}
	}

	function dumpVavigatorSelected() {
		const navigatorInfo = {};
		const selectedProperties = ['vendorSub', 'productSub', 'vendor', 'maxTouchPoints', 'scheduling', 'userActivation', 'geolocation', 'doNotTrack', 'webkitTemporaryStorage', 'webkitPersistentStorage', 'windowControlsOverlay', 'hardwareConcurrency', 'cookieEnabled', 'appCodeName', 'appName', 'appVersion', 'platform', 'product', 'userAgent', 'userAgentData', 'language', 'languages', 'onLine', 'webdriver', 'pdfViewerEnabled', 'connection'];
		selectedProperties.forEach((item) => {
			try {
				navigatorInfo[item] = navigator[item];
			} catch(err) {
				navigatorInfo[item] = 'error: ' + err.message;
			}
		});
		return navigatorInfo;
	}

	function dumpNavigatorAll() {
		const out = {};

		function safeClone(value, depth = 2, seen = new WeakSet()) {
			if (value === null || typeof value !== "object") return value;
			if (seen.has(value)) return "[Circular]";
			seen.add(value);

			if (depth <= 0) return "[Object]";

			const clone = Array.isArray(value) ? [] : {};
			for (const key of Object.getOwnPropertyNames(value)) {
				try {
					const v = value[key];
					clone[key] =
					v && typeof v === "object"
					? safeClone(v, depth - 1, seen)
					: v;
				} catch (err) {
					clone[key] = `[unavailable: ${err.message}]`;
				}
			}
			return clone;
		}

		for (const key of Object.getOwnPropertyNames(Navigator.prototype)
		.concat(Object.getOwnPropertyNames(navigator))) {
			if (key in out) continue;

			try {
				const value = navigator[key];

//				Keep primitives directly
				if (
				value === null ||
				["string", "number", "boolean", "undefined"].includes(typeof value)
				) {
					out[key] = value;
				} else if (Array.isArray(value)) {
					out[key] = value.slice();
				} else if (typeof value === "object") {
//					Try to make nested objects readable
					out[key] = safeClone(value);
				} else if (typeof value === "function") {
//					Skip functions unless you want their names
					out[key] = `[Function ${value.name || "anonymous"}]`;
				}
			} catch (err) {
				out[key] = `[unavailable: ${err.message}]`;
			}
		}
		console.log(out);
		console.log(JSON.stringify(out, null, 2));
		return out;
	}

	function defineWaitCounters() {
		P.waitload = new waitCounter(
			waits => {
				EL.waiticon.style.backgroundColor = 'red';
				EL.waitcount.innerHTML = waits;
			}, 
			waits => {
				EL.waiticon.style.backgroundColor = '#00000000';
				EL.waitcount.innerHTML = '';
				if (waits < 1) {updateFileList();}
			}
		);
		P.waitcanvas = new waitCounter(
			waits => {
				EL.waitcanvas.style.backgroundColor = 'red';
			}, 
			waits => {
				EL.waitcanvas.style.backgroundColor = '#00000000';
			}
		);
	}

	function loadResources() {
		const out = {svg: {}};
		const svgSource = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 256 256" enable-background="new 0 0 256 256" xml:space="preserve"><g><g><path fill="#000000" d="M128,217.4c4.1,0,7.3-3.3,7.3-7.4V73.3c0-4.1-3.3-7.4-7.3-7.4c-4.1,0-7.4,3.3-7.4,7.4V210C120.6,214.1,123.9,217.4,128,217.4z M163.8,217.4l0.4,0c3.9,0,7.1-3,7.3-7l7.8-136.7c0.2-4-2.9-7.6-7-7.8c-4-0.2-7.5,2.9-7.8,6.9l-7.8,136.7C156.7,213.7,159.7,217.2,163.8,217.4z M91.5,217.4l0.4,0c4.1-0.2,7.2-3.7,7-7.8L91.1,72.9c-0.2-4-3.8-7.1-7.8-6.9c-4.1,0.2-7.2,3.7-7,7.8l7.8,136.7C84.3,214.4,87.6,217.4,91.5,217.4z M201,51.4l-10,179.8H65.2L55,51.4H201L201,51.4z M93.5,24.8h69.1l3.6,11.9H89.9L93.5,24.8z M17.3,51.4h22.9L50.9,239c0.2,3.9,3.5,7,7.3,7h139.6c3.9,0,7.2-3.1,7.3-7l10.5-187.6h22.9c4.1,0,7.4-3.3,7.4-7.3c0-4.1-3.3-7.4-7.4-7.4h-57.7l-3.6-19.3c0-4.1-3.3-7.4-7.4-7.4H86.1c-4.1,0-7.4,3.3-7.4,7.4l-3.6,19.3H17.4c-4.1,0-7.4,3.3-7.4,7.4C10,48.1,13.3,51.4,17.3,51.4z"/></g></g></svg>';
		const blob = new Blob([svgSource], {type: 'image/svg+xml'});
		out.svg.wastebasket = URL.createObjectURL(blob);
		return out;
	}

//	============================================================
//	Button: Load images
//	============================================================
    function loadImage() {
		P.waitload.clear();
		const nPics2load = EL.imgfile.files.length;
		if (nPics2load < 1) {
			P.log.write('noimgsel', 'msgerr');
			return false;
		}
		let nPic = P.pics.length;
		Array.from(EL.imgfile.files).forEach(inputfile => {
			logConsole('loadImage - inputfile', inputfile);
			let idx = 0 + nPic++;
			P.pics[idx] = {};
			P.order.push(idx);
			imageLoaderAndConverter(inputfile, P.pics[idx]);
		});
		EL.imgfile.value = '';
    }

	async function getImageMetadata(fileBuffer, params) {
		try {
			const tags = await ExifReader.load(fileBuffer, {expanded: true});
			logConsole('getImageMetadata - tags', tags);
			params.title = selectImageTitle(tags);
			return true;
		} catch(error) {
			console.warn('getImageMetadata - error:', error.message);
			return false;
		}
	}

	function selectImageTitle(exifReaderTags) {
		let tags = exifReaderTags;
		if (isObject(tags)) {
			tags = exifReaderTags.iptc;
			if (isObject(tags)) {
				if ('Object Name' in tags) {return tags['Object Name'].description;}
				if ('Headline' in tags) {return tags['Headline'].description;}
				if ('Caption' in tags) {return tags['Caption'].description;}
				if ('Caption/Abstract' in tags) {return tags['Caption/Abstract'].description;}
			}
			tags = exifReaderTags.exif;
			if (isObject(tags)) {
				if ('ImageDescription' in tags) {return tags['ImageDescription'].description;}
			}
		}
		return '';
	}

	function loadBGimage() {
		P.waitload.clear();
		P.bgimage = {pic: {}};
		cleanElements(EL.c82, EL.c83);
		hideElements(EL.g8);
		if (EL.bgimgfile.files.length < 1) {
			P.log.write('noimgsel', 'msgerr');
			return false;
		}
		imageLoaderAndConverter(EL.bgimgfile.files[0], P.bgimage.pic, (params) => {
			EL.bgthumb = EL.c82.appendChild(params.image.cloneNode(true));
			displayImageMetadata(EL.c83, params);
			showElements(EL.g8);
		});
	}

	function imageLoaderAndConverter(inputfile, params, callback=false) {
		P.waitload.ON();
		params.file = inputfile;

		const loadIntoImage = (blobOrFile) => {
			logConsole('imageLoaderAndConverter - blobOrFile', blobOrFile);
			const fr = new FileReader();
			fr.onload = async (e) => {
				logConsole('FileReader loaded - fr', fr);
				const img = new Image();
				img.onload = e => {
					logConsole('Image loaded - img.length', img.src.length);
					if (img.width > 0 && img.height > 0) {
						params.image = img;
						params.width = img.width;
						params.height = img.height;
						params.ratio = img.width / img.height;
						if (callback) {callback(params);}
					} else {
						params.image = false;
						P.log.write('zerowh', 'msgerr');
						console.warn('loadImage - Empty image not loaded - params', params);
					}
					P.waitload.OFF();
				};
				img.onerror = e => {
					params.image = false;
					P.log.write('imgloaderr', 'msgerr');
					console.warn('loadImage - Image failed to load - params', params);
					P.waitload.OFF();
				};
				getImageMetadata(fr.result, params);
				img.src = fr.result;
			};
			fr.onerror = e => {
				params.image = false;
				P.log.write('filereaderr', 'msgerr');
				console.warn('loadImage - FileReader failed - params, blobOrFile', params, blobOrFile);
				P.waitload.OFF();
			};
			fr.readAsDataURL(blobOrFile);
		};

		(async () => {
			try {
				const isHeic = await HeicTo.isHeic(inputfile);
				if (isHeic) {
					logConsole('HEIC conversion started for', inputfile.name);
					const convertedBlob = await HeicTo({
						blob: inputfile,
						type: 'image/jpeg',
						quality: P.calc.quality
					});
					loadIntoImage(convertedBlob);
				} else {
					loadIntoImage(inputfile);
				}
			} catch (err) {
				P.log.write('heicfail', 'msgerr');
				console.error('loadImage - HEIC detection/conversion failed - inputfile, err', inputfile, err);
				params.image = false;
				P.waitload.OFF();
			}
		})();

	}

	function displayImageMetadata(container, params) {
		const block = createChild(container, 'div', 'imgmetadata');
		createChild(block, 'div', '', params.file.name);
		createChild(block, 'div', '', formatTS(params.file.lastModified));
		createChild(block, 'div', '', formatINT(params.file.size) + ' Bytes');
		createChild(block, 'div', '', params.title);
		createChild(block, 'div', '', formatINT(params.width) + ' * ' + formatINT(params.height) + ' Pixel (B * H)');
	}

//	============================================================
//	Button: Delete loaded images
//	============================================================
	function clearData() {
		P.order = [];
		P.pics = [];
		EL.imgfile.value = '';
		if (EL.ctx) {EL.ctx.clearRect(0, 0, EL.canvas.width, EL.canvas.height);}
		P.waitload.clear();
		EL.filelist.innerHTML = '';
		P.log.clear();
	}
//	============================================================
//	Button: Poster type
//	============================================================
	function setPosterType(type) {
		const oldType = P.posterType;
		switch (type) {
			case 1:
				P.posterType = 1;
				EL.pp1.style.display = 'block';
				EL.pp2.style.display = 'none';
				EL.pp3.style.display = 'none';
				EL.pt1.style.color = '#821717';
				EL.pt2.style.color = '';
				EL.pt3.style.color = '';
				EL.pt1.style.background = '#bfbfbf';
				EL.pt2.style.background = '';
				EL.pt3.style.background = '';
				break;
			case 2:
				P.posterType = 2;
				EL.pp1.style.display = 'none';
				EL.pp2.style.display = 'block';
				EL.pp3.style.display = 'none';
				EL.pt1.style.color = '';
				EL.pt2.style.color = '#821717';
				EL.pt3.style.color = '';
				EL.pt1.style.background = '';
				EL.pt2.style.background = '#bfbfbf';
				EL.pt3.style.background = '';
				break;
			case 3:
				P.posterType = 3;
				EL.pp1.style.display = 'none';
				EL.pp2.style.display = 'none';
				EL.pp3.style.display = 'block';
				EL.pt1.style.color = '';
				EL.pt2.style.color = '';
				EL.pt3.style.color = '#821717';
				EL.pt1.style.background = '';
				EL.pt2.style.background = '';
				EL.pt3.style.background = '#bfbfbf';
				break;
		}
		if (P.posterType != oldType) {
			P.calc = {};
			removeDownloadLink();
		}
	}
//	============================================================
//	Button: Output type
//	============================================================
	function setOutputType(type) {
		const oldType = P.outputType;
		switch (type) {
			case 1:
				P.outputType = 1;
				EL.ot1.style.color = '#821717';
				EL.ot2.style.color = '';
				EL.ot1.style.background = '#bfbfbf';
				EL.ot2.style.background = '';
				document.querySelectorAll('.modeHTML').forEach(ele => {ele.style.display = 'none';});
				document.querySelectorAll('.modeCanvas').forEach(ele => {ele.style.display = '';});
				break;
			case 2:
				P.outputType = 2;
				EL.ot1.style.color = '';
				EL.ot2.style.color = '#821717';
				EL.ot1.style.background = '';
				EL.ot2.style.background = '#bfbfbf';
				document.querySelectorAll('.modeHTML').forEach(ele => {ele.style.display = '';});
				document.querySelectorAll('.modeCanvas').forEach(ele => {ele.style.display = 'none';});
				break;
		}
		if (P.outputType != oldType) {removeDownloadLink();}
	}
//	============================================================
//	Button: Generate poster
//	============================================================
	function makePoster() {
		removeDownloadLink();
		if (!calculate()) {return false;}
		P.waitcanvas.clear();
		P.waitcanvas.ON();
		P.RT.start('makePoster');
		if (P.calc.postername) {
			P.posterWindowName = P.calc.postername;
		} else {
			P.posterWindowName = 'poster' + P.posterType;
		}
		const finish = function() {
			const calctime = P.RT.show('makePoster');
			if (success) {
				P.log.write(P.RT.showtime(calctime, P.messages.getmsg('postergen') + ': '));
			} else {
				P.log.write('posgenerr', 'msgerr');
			}
			P.waitcanvas.OFF();
			updateFileList();
		};
		let success = false;;
		switch (P.outputType) {
			case 1:
				setTimeout(() => {success = makeCanvas(); finish();}, P.timeout);
				return 'makeCanvas';
			case 2:
				setTimeout(() => {success = makeNoCanvas(); finish();}, P.timeout);
				return 'makeNoCanvas';
		}
		return false;
	}

	function makeCanvas() {
		logConsole('... starting makeCanvas ...');
		let border;
		P.calc.windowWidth = P.calc.canvasWidth + 16;			// adjustment by
		P.calc.windowHeight = P.calc.canvasHeight + 10;			// trial and error
		P.canwindow = createWindow(P.posterWindowName, 
			'<title>Poster Ansicht</title>', 
			'<canvas id="canvas"></canvas>', {
			width: P.calc.windowWidth, 
			height: P.calc.windowHeight, 
			top: parseInt(screen.height*0.1), 
			left: parseInt(screen.width*0.1)
		});
		if (!P.canwindow) {
			P.log.write('wincreafail', 'msgerr');
			return false;
		}

		EL.canvas = P.canwindow.document.getElementById("canvas");
		EL.canvas.width = P.calc.canvasWidth;
		EL.canvas.height = P.calc.canvasHeight;
		EL.ctx = EL.canvas.getContext("2d");
		EL.ctx.fillStyle = P.calc.bgcol;
		EL.ctx.fillRect(0, 0, EL.canvas.width, EL.canvas.height);
		if (P.calc.bgimg) {drawBackgroundImageOnCanvas(EL.ctx, P.bgimage?.pic);}
		EL.filelist.innerHTML = '';
		P.calc.pos.forEach((item, ipos) => {
			if (ipos < P.calc.n) {
				if (P.calc.borderCSS || P.calc.corner) {
					EL.ctx.save();
					border = canvasBorderWithRoundedCorners(item.left, item.top, item.width, item.height, P.calc.corner);
					EL.ctx.clip(border);
				}
				if (item.clip) {
					EL.ctx.drawImage(P.pics[item.idx].image, item.clip.left, item.clip.top, item.clip.width, item.clip.height, item.left, item.top, item.width, item.height);
				} else {
					EL.ctx.drawImage(P.pics[item.idx].image, item.left, item.top, item.width, item.height);
				}
				if (P.calc.borderCSS || P.calc.corner) {
					EL.ctx.restore();
					EL.ctx.save();
					EL.ctx.lineWidth = P.calc.borderwidth;
					EL.ctx.setLineDash(canvasLineDash());
					EL.ctx.strokeStyle = P.calc.bordercolor;
					EL.ctx.stroke(border);
					EL.ctx.restore();
				}				
			}
		});
		
		if (P.calc.imcap) {drawCaptionsOnCanvas(EL.ctx);}
		
		createDownloadLink(EL.canvas, P.posterWindowName);
		
		return true;
	}

	function makeNoCanvas() {
		logConsole('... starting makeNoCanvas ...');
		let divele, imgele, picnum = 1;
		P.calc.windowWidth = P.calc.canvasWidth + 16;			// adjustment by
		P.calc.windowHeight = P.calc.canvasHeight + 10;			// trial and error
		P.nocanWindow = createWindow(P.posterWindowName, 
			'', 
			'<div id="nocanvas"></div>', {
			width: P.calc.windowWidth, 
			height: P.calc.windowHeight, 
			top: parseInt(screen.height*0.1), 
			left: parseInt(screen.width*0.1)
		});
		if (!P.nocanWindow) {
			P.log.write('wincreafail', 'msgerr');
			return false;
		}
		HTelementChild(P.nocanWindow.document.head, 'title', 'Poster Ansicht');
		HTelementChild(P.nocanWindow.document.head, 'style', `
	img {box-sizing: border-box;}
	.modimg {position: fixed; z-index: 90; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden; background-color: rgba(0,0,0,0.75); display: none;}
	.modimg > div {position: relative; width: max-content; height: max-content; background-color: #efefef; margin: 24px auto; padding: 16px; border-radius: 7px;}
	.modimg span {position: absolute; top: -18px; right: -18px; z-index: 91; color: #1f1f1f; background-color: #efefef; font-family: Arial; font-size: 48px; font-weight: bold; text-align: center; line-height: 36px; height: 36px; width: 36px; border-radius: 36px;}
	.modimg span:hover {color: #efefef; background-color: #1f1f1f; text-decoration: none; cursor: pointer;}
	.modimg button {position: absolute; top: 50%; z-index: 91; color: #202020; text-shadow: 0 0 7px white; background-color: transparent; border: none; font-size: 48px;}
	.modimg button.right {right: -30px;}
	.modimg button.left {left: -30px;}
	.modimg button:hover {color: #606060; text-shadow: 0 0 7px #602020; cursor: pointer;}
	.modimg figure {margin: 0;}
	.modimg img {position: relative; max-width: 90vw; max-height: 90vh;}
	.modimg figcaption {text-align: center;}`);
		HTelementChild(P.nocanWindow.document.head, 'script', [
			modalPic.toString(), 
			modalPicClose.toString(), 
			modalPicNext.toString(), 
			modalButtonVisibility.toString(), 
			saveFileViaDownload.toString(), 
			keyAction.toString(), 
			HTelementChild.toString()
		].join("\n"));
		
		EL.nocanvas = P.nocanWindow.document.getElementById("nocanvas");
		EL.nocanvas.style.width = P.calc.canvasWidth;
		EL.nocanvas.style.height = P.calc.canvasHeight;
		EL.nocanvas.style.backgroundColor  = P.calc.bgcol;
		EL.nocanvas.style.position  = 'relative';
		if (P.calc.bgimg) {drawBackgroundImageOnDiv(EL.nocanvas, P.bgimage?.pic);}
		EL.filelist.innerHTML = '';
		P.calc.pos.forEach((item, ipos) => {
			if (ipos < P.calc.n) {
				divele = HTelementChild(EL.nocanvas, 'div', '', {
					position: 'absolute', 
					top: item.top + 'px', 
					left: item.left + 'px', 
					width: item.width + 'px', 
					height: item.height + 'px'
				});
				imgele = divele.appendChild(P.pics[item.idx].image.cloneNode(true));
				imgele.id = 'pic' + picnum++;
				imgele.setAttribute('alt', P.pics[item.idx].file.name);
				imgele.setAttribute('onclick', 'modalPic(this);');
				imgele.style.width = item.width + 'px';
				imgele.style.height = item.height + 'px';
				if (item.fit) {imgele.style.objectFit = item.fit;}
				if (P.calc.borderCSS) {imgele.style.border = P.calc.borderCSS;}
				if (P.calc.cornerCSS) {imgele.style.borderRadius = P.calc.cornerCSS;}				
			}
		});
		
		if (P.calc.imcap) {drawCaptionsOnDiv(EL.nocanvas);}
		
		HTelementChild(P.nocanWindow.document.body, 'div', '', {}, {id: 'modalPic', class: 'modimg'});
		HTelementChild(P.nocanWindow.document.body, 'script', "document.body.addEventListener('keydown', keyAction);");

		createDownloadLink(EL.nocanvas, P.posterWindowName);

		return true;
	}

	function removeDownloadLink() {
		EL.pw4.innerHTML = '';
	}

	function createDownloadLink(poster, filebasename) {
		function buildDownloadLink(dataURL, filename) {
			removeDownloadLink();
			EL.downloadlink = createChild(EL.pw4, 'a', {href: dataURL, download: filename, class: 'buttonlink', langkey: 'pw3'}, P.messages.getmsg('pw3'));
		}

		switch (P.outputType) {
			case 1:
				logConsole('... starting render - canvas:', poster);
				switch (P.calc.filetype) {
					case 'png':
						poster.toBlob((blob) => {
							buildDownloadLink(URL.createObjectURL(blob), filebasename + '.png')
						});
						break;
					default:
						buildDownloadLink(poster.toDataURL('image/jpeg', P.calc.quality), filebasename + '.jpg');
				}
				return 'makeCanvas';
			case 2:
				logConsole('... starting render - node:', poster);
				switch (P.calc.filetype) {
					case 'png':
						domtoimage.toBlob(poster)
						.then(blob => {
							buildDownloadLink(URL.createObjectURL(blob), filebasename + '.png');
						})
						.catch(error => {
							console.error('domtoimage.toBlob - errormessage:', error);
						});
						break;
					default:
						domtoimage.toJpeg(poster, {quality: P.calc.quality })
						.then(dataUrl => {
							buildDownloadLink(dataUrl, filebasename + '.jpg');
						})
						.catch(error => {
							console.error('domtoimage.toJpeg - errormessage:', error);
						});
				}
				return 'makeNoCanvas';
			default:
				P.log.write('nothingtodownload', 'msgerr');
				return false;
		}
	}

	function canvasBorderWithRoundedCorners(left, top, width, height, radius) {
		const border = new Path2D();
		const w90 = 0.5 * Math.PI, w180 = Math.PI, w270 = 1.5 * Math.PI, w360 = 2 * Math.PI;
		radius = radius > 0 ? radius : 0;
		border.moveTo(left + radius, top);
		border.lineTo(left + width - radius, top);
		border.arc(left + width - radius, top + radius, radius, w270,  w360);
		border.lineTo(left + width, top + height - radius);
		border.arc(left + width - radius, top + height - radius, radius, 0,  w90);
		border.lineTo(left + radius, top + height);
		border.arc(left + radius, top + height - radius, radius, w90, w180);
		border.lineTo(left, top + radius);
		border.arc(left + radius, top + radius, radius, w180, w270);
		border.closePath();
		return border;
}

	function canvasLineDash() {
		if (P.calc.borderdash) {
			return P.calc.borderdash.replaceAll(',', ' ').trim().split(/[\s,\t,\n]+/).map(x => {return parseInt(x);});
		} else {
			return [];
		}
	}

	function drawBackgroundImageOnCanvas(ctx, bgimage) {
		if (!ctx || !bgimage || !bgimage.image || !bgimage.width || !bgimage.height) return;

		const canvasWidth  = P.calc.canvasWidth  || ctx.canvas.width;
		const canvasHeight = P.calc.canvasHeight || ctx.canvas.height;
		const img = bgimage.image;

//		Check whether the image is ready / usable
		const validImage =
		(img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) ||
		(img instanceof HTMLCanvasElement && img.width > 0 && img.height > 0) ||
		(img instanceof ImageBitmap) ||
		(img instanceof HTMLVideoElement && img.readyState >= 2);
		if (!validImage) return;

		const oldAlpha = ctx.globalAlpha;
		const oldSmoothing = ctx.imageSmoothingEnabled;
		ctx.save();

//		Opacity
		ctx.globalAlpha = P.calc.bgimgopacity;

		const mode = P.calc.bgimgtransform || "contain";
		const pos = String(P.calc.bgimgpos || "CM").toUpperCase();
		const hPos = pos[0] || "C";
		const vPos = pos[1] || "M";
		const iw = bgimage.width;
		const ih = bgimage.height;

		function alignX(dw) {
			if (hPos === "L") return 0;
			if (hPos === "R") return canvasWidth - dw;
			return (canvasWidth - dw) / 2;
		}

		function alignY(dh) {
			if (vPos === "T") return 0;
			if (vPos === "B") return canvasHeight - dh;
			return (canvasHeight - dh) / 2;
		}

		function tileImage(dx, dy, dw, dh) {
//			First tile that can touch the visible canvas area
			const startX = Math.floor((0 - dx) / dw) * dw + dx;
			const startY = Math.floor((0 - dy) / dh) * dh + dy;

			for (let y = startY; y < canvasHeight; y += dh) {
				for (let x = startX; x < canvasWidth; x += dw) {
					ctx.drawImage(img, x, y, dw, dh);
				}
			}
		}

		if (mode === "fill") {
			ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
		} else if (mode === "cover") {
			const scale = Math.max(canvasWidth / iw, canvasHeight / ih);
			const dw = iw * scale;
			const dh = ih * scale;
			const dx = alignX(dw);
			const dy = alignY(dh);
			ctx.drawImage(img, dx, dy, dw, dh);
		} else { // contain
			const dx = alignX(iw);
			const dy = alignY(ih);

			if (iw >= canvasWidth && ih >= canvasHeight) {
//				If the image fully covers the canvas, one draw is enough.
				ctx.drawImage(img, dx, dy, iw, ih);
			} else {
//				Draw the main image and repeat it to fill missing areas.
				tileImage(dx, dy, iw, ih);
			}
		}

		ctx.restore();
		ctx.globalAlpha = oldAlpha;
		ctx.imageSmoothingEnabled = oldSmoothing;
	}

	function drawBackgroundImageOnDiv(divElement, bgimage) {
		if (!divElement || !bgimage || !bgimage.image || !bgimage.width || !bgimage.height) return;

		const img = bgimage.image;
		const validImage =
		(img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) ||
		(img instanceof HTMLCanvasElement && img.width > 0 && img.height > 0) ||
		(img instanceof ImageBitmap) ||
		(img instanceof HTMLVideoElement && img.readyState >= 2);

		if (!validImage) return;

		const canvasWidth  = P.calc.canvasWidth  || divElement.clientWidth;
		const canvasHeight = P.calc.canvasHeight || divElement.clientHeight;

		const mode = String(P.calc.bgimgtransform || "contain").toLowerCase();
		const pos  = String(P.calc.bgimgpos || "CM").toUpperCase();
		const hPos = pos[0] || "C";
		const vPos = pos[1] || "M";
		const opacity = (P.calc.bgimgopacity == null) ? 1 : P.calc.bgimgopacity;

		function alignX(dw) {
			if (hPos === "L") return 0;
			if (hPos === "R") return canvasWidth - dw;
			return (canvasWidth - dw) / 2;
		}

		function alignY(dh) {
			if (vPos === "T") return 0;
			if (vPos === "B") return canvasHeight - dh;
			return (canvasHeight - dh) / 2;
		}

		function backgroundPositionString(hPos, vPos) {
			const x = hPos === "L" ? "left" : hPos === "R" ? "right" : "center";
			const y = vPos === "T" ? "top" : vPos === "B" ? "bottom" : "center";
			return `${x} ${y}`;
		}

//		Reuse or create the background layer
		let layer = divElement.querySelector(":scope > .bg-image-layer");
		if (!layer) {
			layer = document.createElement("div");
			layer.className = "bg-image-layer";
			layer.style.position = "absolute";
			layer.style.left = "0";
			layer.style.top = "0";
			layer.style.pointerEvents = "none";
			layer.style.overflow = "hidden";
			divElement.insertBefore(layer, divElement.firstChild);
		}

		layer.style.width = canvasWidth + "px";
		layer.style.height = canvasHeight + "px";
		layer.style.opacity = String(opacity);
		layer.style.backgroundImage = `url("${img.src || ""}")`;
		layer.style.backgroundRepeat = "no-repeat";
		layer.style.backgroundPosition = "0 0";
		layer.style.backgroundSize = "auto";

		const iw = bgimage.width;
		const ih = bgimage.height;

		if (mode === "fill") {
			layer.style.backgroundSize = "100% 100%";
			layer.style.backgroundPosition = "0 0";
		} else if (mode === "cover") {
			layer.style.backgroundSize = "cover";
			layer.style.backgroundPosition = backgroundPositionString(hPos, vPos);
		} else {
//			contain
			layer.style.backgroundSize = "auto";
			layer.style.backgroundRepeat = "repeat";
			layer.style.backgroundPosition = backgroundPositionString(hPos, vPos);
		}
	}

	function drawCaptionsOnCanvas(ctx) {
		if (!ctx || !window.P || !P.calc || !Array.isArray(P.calc.pos) || !Array.isArray(P.pics)) {return;}

		const fontFamily = P.calc.titlefontfamily || "sans-serif";
		const fontSize = Number(P.calc.titlefontsize) || 16;
		const color = P.calc.titlecolor || "#000";
		const colorstroke = P.calc.titlecolorstroke || "#FF7";
		const strokewidth = P.calc.titlestrokewidth || 3;
		const useFilename = !!P.calc.titleusefilename;
		const imageAnchor = (P.calc.titleimageanchor || "CM").toUpperCase();
		const textAnchor = (P.calc.titletextanchor || "CM").toUpperCase();
		const dist = P.calc.titledistances || { x: 0, y: 0 };
		const angleDeg = Number(P.calc.titleangle) || 0;
		const angleRad = angleDeg * Math.PI / 180;

		for (let i = 0; i < P.calc.pos.length; i++) {
			const pos = P.calc.pos[i];
			if (!pos) continue;

			const pic = P.pics[pos.idx];
			if (!pic) continue;

			let textContent = pic.title || '';
			if (useFilename && !textContent) {textContent = pic.file && pic.file.name ? pic.file.name : '';}
			if (!textContent) continue;

			const imgRef = getAnchorPointXY(pos, imageAnchor);
			const textRef = getAnchorPointXY(getCanvasTextBox(ctx, textContent, fontSize, fontFamily), textAnchor);
			const targetX = imgRef.x + (Number(dist.x) || 0);
			const targetY = imgRef.y + (Number(dist.y) || 0);

			ctx.save();
			ctx.font = `${fontSize}px ${fontFamily}`;
			ctx.fillStyle = color;
			ctx.strokeStyle = colorstroke;
			ctx.lineWidth = strokewidth;
			ctx.translate(targetX, targetY);
			ctx.rotate(angleRad);
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.strokeText(textContent, -textRef.x, -textRef.y);
			ctx.fillText(textContent, -textRef.x, -textRef.y);
			ctx.restore();
		}
	}

	function drawCaptionsOnDiv(divElement) {
		if (!divElement || !window.P || !P.calc || !Array.isArray(P.calc.pos) || !Array.isArray(P.pics)) {return;}

		const canvasWidth  = P.calc.canvasWidth  || divElement.style.width;
		const canvasHeight = P.calc.canvasHeight || divElement.style.height;

		const fontFamily = P.calc.titlefontfamily || "sans-serif";
		const fontSize = Number(P.calc.titlefontsize) || 16;
		const color = P.calc.titlecolor || "#000";
		const colorstroke = P.calc.titlecolorstroke || "#FF7";
		const strokewidth = P.calc.titlestrokewidth || 3;
		const useFilename = !!P.calc.titleusefilename;
		const imageAnchor = (P.calc.titleimageanchor || "CM").toUpperCase();
		const textAnchor = (P.calc.titletextanchor || "CM").toUpperCase();
		const dist = P.calc.titledistances || { x: 0, y: 0 };
		const angleDeg = Number(P.calc.titleangle) || 0;
		const angleRad = angleDeg * Math.PI / 180;

		const container = createChild(divElement, 'div', {style: 'position: absolute; left: 0; top: 0;'});
		container.style.width = canvasWidth + "px";
		container.style.height = canvasHeight + "px";

		for (let i = 0; i < P.calc.pos.length; i++) {
			const pos = P.calc.pos[i];
			if (!pos) continue;
			const pic = P.pics[pos.idx];
			if (!pic) continue;

			let textContent = pic.title || '';
			if (useFilename && !textContent) {textContent = pic.file && pic.file.name ? pic.file.name : '';}
			if (!textContent) continue;

//			measure text with a temporary element
			const textBox = getDivTextBox(textContent, fontSize, fontFamily);
			const textRef = getAnchorPointXY(textBox, textAnchor);
			const imgRef = getAnchorPointXY(pos, imageAnchor);

			const targetX = imgRef.x + (Number(dist.x) || 0);
			const targetY = imgRef.y + (Number(dist.y) || 0);

			const caption = HTelementChild(container, 'div', textContent, style={
				position: 'absolute',
				left: targetX + 'px',
				top: targetY + 'px',
				fontFamily: fontFamily,
				fontSize: fontSize + 'px',
				color: color,
				whiteSpace: 'nowrap',
				transformOrigin: '0 0'
			});

//			approximate stroke via text-shadow (multiple offsets)
			if (strokewidth > 0 && colorstroke) {
				const w = strokewidth;
				caption.style.textShadow =
					`${w}px 0 ${colorstroke},` +
					`-${w}px 0 ${colorstroke},` +
					`0 ${w}px ${colorstroke},` +
					`0 -${w}px ${colorstroke}`;
			}

//			combine rotation + internal translation like canvas translate+rotate+draw
			const dx = -textRef.x;
			const dy = -textRef.y;
			caption.style.transform = `rotate(${angleDeg}deg) translate(${dx}px, ${dy}px)`;
		}
	}

	function getAnchorPointXY(box, anchor) {
		const h = anchor[0] || "C";
		const v = anchor[1] || "M";
		function splitAnchor(value, first, last, pos, size) {
			if (value == first) {
				return pos;
			} else if (value == last) {
				return pos + size;
			} else {
				return pos + size / 2;
			}				
		}
		return {
			x: splitAnchor(h, 'L', 'R', box.left, box.width), 
			y: splitAnchor(v, 'T', 'B', box.top, box.height)
		};
	}

	function getCanvasTextBox(ctx, textContent, fontSize, fontFamily) {
		ctx.font = `${fontSize}px ${fontFamily}`;
		ctx.textBaseline = 'alphabetic';
		ctx.textAlign = 'left';
		const metrics = ctx.measureText(textContent);
		return {
			left: -metrics.actualBoundingBoxLeft,
			top: -metrics.actualBoundingBoxAscent,
			width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
			height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
		};
	}

	function getDivTextBox(textContent, fontSize, fontFamily) {
		const tmp = document.createElement('div');
		tmp.textContent = textContent;
		tmp.style.position = 'absolute';
		tmp.style.visibility = 'hidden';
		tmp.style.whiteSpace = 'nowrap';
		tmp.style.fontFamily = fontFamily;
		tmp.style.fontSize = fontSize + 'px';
		tmp.style.lineHeight = 'normal'; // closer to canvas
		document.body.appendChild(tmp);

		const rect = tmp.getBoundingClientRect();
		document.body.removeChild(tmp);

		return {
			left: 0,
			top: 0,
			width: rect.width,
			height: rect.height
		};
	}

	function createWindow(winName, winHead, winBody, winFeatures) {
		const windowFeatures = featureString(Object.assign({
			toolbar: 'no',
			location: 'no',
			directories: 'no',
			status: 'no',
			menubar: 'no',
			scrollbars: 'no',
			resizable: 'yes',
			width: 960,
			height: 640,
			top: 10,
			left: 10
		}, winFeatures));

		const newWindow = window.open('', winName, windowFeatures);
		if (!newWindow) {
			console.warn('createWindow failure - winFeatures:', winFeatures);
			return false;
			}
		if (winHead) {newWindow.document.head.innerHTML = winHead;}
		if (winBody) {newWindow.document.body.innerHTML = winBody;}
		return newWindow;
	}

	function featureString(features) {
		let parts = [];
		Object.entries(features).forEach(([k, v]) => {
			if (v === true) {
				parts.push(k);
			} else {
				parts.push(k + '=' + v);
			}
		});
		return parts.join(', ');
	}
//	============================================================
//	NoCanvas window special functions
//	============================================================
	function HTelementChild(parent, tag, innerHTML='', style={}, attrib={}) {
		const newele = document.createElement(tag);
		newele.innerHTML = innerHTML;
		for (item in style) {newele.style[item] = style[item];}
		for (item in attrib) {newele.setAttribute(item, attrib[item]);}
		parent.appendChild(newele);
		return newele;
	}

	function keyAction(event) {
		if (event.ctrlKey && event.key == 's') {
			saveFileViaDownload(document.documentElement.innerHTML, 'poster.html', 'text/html');
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.key == 'ArrowRight' || event.key == 'PageDown') {
			modalPicNext('N');
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.key == 'ArrowLeft' || event.key == 'PageUp') {
			modalPicNext('P');
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.key == 'Home') {
			modalPicNext('F');
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.key == 'End') {
			modalPicNext('L');
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.key == 'Escape') {
			modalPicClose(true);
			event.preventDefault();
			event.stopPropagation();
			return;
		}
	}

	function saveFileViaDownload(content, fileName, contentType) {
		const a = document.createElement('a');
		const data = new Blob([content], { type: contentType});
		a.href = URL.createObjectURL(data);
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
	}

	function modalPic(ele) {
		const modalPic = document.getElementById('modalPic');
		modalPic.innerHTML = '';
		modalPic.addEventListener('click', modalPicClose);
		const divele = HTelementChild(modalPic, 'div');
		const closebutton = HTelementChild(divele, 'span', '&times;');
		const rightbutton = HTelementChild(divele, 'button', '&#x25B6;', {}, {class: 'right', onclick: 'modalPicNext(\'N\'); event.stopPropagation();'});
		const leftbutton = HTelementChild(divele, 'button', '&#x25C0;', {}, {class: 'left', onclick: 'modalPicNext(\'P\'); event.stopPropagation();'});
		const figure = HTelementChild(divele, 'figure');
		const img = HTelementChild(figure, 'img');
		img.src = ele.src;
		img.refid = ele.id;
		modalButtonVisibility(img.refid);
		const figcaption = HTelementChild(figure, 'figcaption', ele.alt);
		modalPic.style.display = 'block';
	}

	function modalPicClose(force=false) {
		const modalPic = document.getElementById('modalPic');
		const closebutton = modalPic.querySelector('span');
		if (event.target == modalPic || event.target == closebutton || force) {
			modalPic.innerHTML = '';
			modalPic.style.display = 'none';
		}
	}

	function modalPicNext(pos) {
		let picNum, targetPic;
		const nocanvas = document.getElementById('nocanvas');
		const modalPic = document.getElementById('modalPic');
		if (!modalPic) {return false;}
		const img = modalPic.querySelector('img');
		if (!img) {return false;}
		const picCount = nocanvas.querySelectorAll('img').length;
		const curPicNum = parseInt(img.refid.substr(3));
		picNum = parseInt(pos);
		if (picNum > 0) {
			targetPic = document.getElementById('pic' + picNum);
		} else {
			targetPic = false;
			switch (pos) {
				case 'F':
					targetPic = document.getElementById('pic1');
					break;
				case 'L':
					targetPic = document.getElementById('pic' + picCount);
					break;
				case 'N':
					picNum = curPicNum + 1;
					if (picNum > 0 && picNum <= picCount) {targetPic = document.getElementById('pic' + picNum);}
					break;
				case 'P':
					picNum = curPicNum - 1;
					if (picNum > 0 && picNum <= picCount) {targetPic = document.getElementById('pic' + picNum);}
					break;
			}
		}
		if (targetPic) {
			img.src = targetPic.src;
			img.refid = targetPic.id;
			modalButtonVisibility(img.refid);
			modalPic.querySelector('figcaption').innerHTML = targetPic.alt;
		}
	}

	function modalButtonVisibility(refid) {
		const modalPic = document.getElementById('modalPic');
		const picCount = nocanvas.querySelectorAll('img').length;
		const picNum = parseInt(refid.substr(3));
		const right = modalPic.querySelector('button.right');
		const left = modalPic.querySelector('button.left');
		left.style.display = picNum <= 1 ? 'none' : '';
		right.style.display = picNum >= picCount ? 'none' : '';
	}
//	============================================================
//	Calculation
//	============================================================
	function calculate() {
		if (P.pics.length > 0) {
			P.RT.start('calculate');
			getDialogueParameters();
			const finish = function() {
				const calctime = P.RT.show('calculate');
				if (success) {
					P.log.write(P.RT.showtime(calctime, P.messages.getmsg('calcdone') + ': '));
				} else {
					P.log.write('calcfail', 'msgerr');
				}
			};
			let success = false;
			switch (P.posterType) {
				case 1:		// Grid
					setTimeout(() => {success = calculate1(); finish();}, P.timeout);
					return 1;
				case 2:		// Horizontal stripes
					setTimeout(() => {success = calculate2(); finish();}, P.timeout);
					return 2;
				case 3:		// Vertical stripes
					setTimeout(() => {success = calculate3(); finish();}, P.timeout);
					return 3;
			}
		} else {return false;}
	}

	function getDialogueParameters() {
//	Read all user entry and convert appropriately
		logConsole('getDialogueParameters - Start');
		P.calc = {};
		const typeDependentKeys = ['aspect', 'fit', 'colcount', 'rowcount', 'singleWidth', 'singleHeight', 'targetWidth', 'targetHeight'];
		const integerValueKeys = ['colcount', 'rowcount', 'singleWidth', 'singleHeight', 'targetWidth', 'targetHeight', 'borderwidth', 'corner'];

		for (const [name, ele] of Object.entries(EL)) {
			if (!('tagName' in ele)) {continue;}
			switch (ele.tagName.toLowerCase()) {
				case 'input':
					switch (ele.type.toLowerCase()) {
						case 'text':
						case 'color':
							P.calc[name] = ele.value;
							break;
						case 'radio':
							if (ele.checked && ele.name) {P.calc[ele.name] = ele.value;}
							break;
						case 'checkbox':
							P.calc[name] = ele.checked;
							break;
					}
					break;
				case 'select':
					P.calc[name] = ele.value;
					break;
			}
		}

		const pt = P.posterType.toString();
		typeDependentKeys.forEach(key => {
			const src = key + pt;
			if (Object.hasOwn(P.calc, src) && P.calc[src] !== undefined) {
				P.calc[key] = P.calc[src];
			}
//			if (key + pt in P.calc) {P.calc[key] = P.calc[key + pt];}
		});

		if (P.calc.margins) {
			const marginValue = P.calc.margins;
			P.calc.margins = Object.assign({}, marginSplit(P.calc.margins, ['top', 'right', 'bottom', 'left']));
		} else {
			P.calc.margins = {};
		}
		P.calc.margins = Object.assign(P.calc.margins, marginSplit(P.calc.gaps, ['gapHorizontal', 'gapVertical']));

		integerValueKeys.forEach(key => {
			if (key in P.calc) {P.calc[key] = parseInt(P.calc[key] || 0);}
		});
		
		['colgrid', 'rowgrid'].forEach(key => {
			if (P.calc[key]) {
				P.calc[key] = parseGritInput(P.calc[key]);
				if (P.calc[key]) {P.calc.imagesToShow = P.calc[key].reduce((a, b) => a + b, 0);}
			}
		});
		
		if (P.calc.borderwidth && P.outputType == 1 && !P.calc.borderstyle) {
			P.calc.borderstyle = 'solid';
			EL.borderstyle.value = 'solid';
		}
		P.calc.borderCSS = (P.calc.borderwidth && P.calc.borderstyle) ? P.calc.borderwidth + 'px ' + P.calc.borderstyle + ' ' + P.calc.bordercolor : '';
		P.calc.cornerCSS = P.calc.corner ? P.calc.corner + 'px' : '';
		[EL.quality.value, P.calc.quality] = validateUserInput('percent', P.calc.quality, 0.9);
		if (P.calc.bgimg) {
			[EL.bgimgpos.value, P.calc.bgimgpos] = validateUserInput('position', P.calc.bgimgpos);
			[EL.bgimgopacity.value, P.calc.bgimgopacity] = validateUserInput('percent', P.calc.bgimgopacity, 1);
		}
		if (P.calc.imcap) {
			[EL.titleimageanchor.value, P.calc.titleimageanchor] = validateUserInput('position', P.calc.titleimageanchor);
			[EL.titletextanchor.value, P.calc.titletextanchor] = validateUserInput('position', P.calc.titletextanchor);
			[EL.titledistances.value, P.calc.titledistances] = validateUserInput('xy', P.calc.titledistances);
		}

		logConsole('getDialogueParameters - P.calc snapshot):', JSON.parse(JSON.stringify(P.calc)));
	}

	function parseGritInput(grid) {
//		Convert 1,2,3 ... or 3*4 to array with count of images per row (column)
		let check = grid.split(/(?:\*|x|X)+/).map(Number);
		if (check.some(isNaN) || check.length != 2) {
			check = grid.split(/(?:,| )+/).map(Number);
			if (check.some(isNaN)) {return false;}
			return check;
		} else {
			let out = [];
			for (let i=0; i<check[0]; i++) {out.push(check[1]);}
			return out;
		}
	}

	function marginSplit(margins, params) {
//	Handle data entry for margins and gaps
		const outobj = {};
		try {
			const M = margins.split(',').map(m => parseInt(m));
			switch (M.length) {
				case 1:
					params.forEach(p => {outobj[p] = M[0];});
					break;
				case 2:
					params.forEach((p, i) => {outobj[p] = M[i%2];});
					break;
				case 3:
					const J = [0, 1, 2, 1];
					params.forEach((p, i) => {outobj[p] = M[J[i%4]];});
					break;
				case 4:
					params.forEach((p, i) => {outobj[p] = M[i%4];});
					break;
			}
		} catch (error) {
			console.warn('marginSplit - error:', error.message);
		}
		return outobj;
	}

	function validateUserInput(mode, userInput, defaultValue=null) {
//		Returns [validatedStringForDisplay, validatedVariableForProcessing]
		if (!(defaultValue == null) && !Array.isArray(defaultValue)) {
			defaultValue = [String(defaultValue), defaultValue];
		}
		switch (mode.toLowerCase()) {
			case 'position':
//				Valid Position (2 chars uppercase, first: L/C/R, second: T/M/B)
				const langSpecific = (value) => {
					switch (P.messages.options.lang) {
						case 'de':
							return value.replace('C', 'M').replace('T', 'O').replace('B', 'U');
						default:
							return value;
					}
				};
				if (defaultValue == null) {defaultValue = [langSpecific('CM'), 'CM'];}
				const letters = String(userInput).replace(/[^a-z]/gi, '');
				if (letters.length !== 2) return defaultValue;
				const first = letters[0].toUpperCase();
				const second = letters[1].toUpperCase();
				const firstMap = {L: 'L', M: 'C', C: 'C', R: 'R'};
				const secondMap = {O: 'T', T: 'T', C: 'M', M: 'M', U: 'B', B: 'B'};
				const mappedFirst = firstMap[first];
				const mappedSecond = secondMap[second];
				if (!mappedFirst || !mappedSecond) return defaultValue;
				return [langSpecific(mappedFirst + mappedSecond), mappedFirst + mappedSecond];
			case 'percent':
//				Valid percent number as float between 0 and 1
				if (defaultValue == null) defaultValue = ['0', 0];
				const raw = String(userInput).trim();
				const hasPercent = raw.includes('%');
				const cleaned = raw
				.replace(/[^0-9.,]/g, '')		// keep only digits, dot, comma
				.replace(/,/g, '.');			// comma means dot
				if (!cleaned) return defaultValue;
				const value = parseFloat(cleaned);
				if (Number.isNaN(value)) return defaultValue;
				const result = hasPercent ? value / 100 : value;
				const work = result < 0 ? 0 : result > 1 ? 1 : result;
				return [String(work), work];
			case 'xy':
//				Pair of x any y values separated by comma or space
				if (defaultValue == null) defaultValue = ['', {x: 0, y: 0}];
				if (typeof userInput !== 'string') return defaultValue;
				const parts = userInput.trim().split(/[\s,]+/);
				if (parts.length !== 2) return defaultValue;
				const x = Number(parts[0]);
				const y = Number(parts[1]);
				if (!Number.isFinite(x) || !Number.isFinite(y)) return defaultValue;
				const display = (x == 0 && y == 0) ? '' : String(x) + ', ' + String(y);
				return [display, { x, y }];
			default:
				console.warn('validateUserInput', items, target);
				return [userInput, userInput]
		}
	}

	function calculate1() {
		P.RT.start('calculate1');
		P.calc.colcount = parseInt(P.calc.colcount);
		if (!(P.calc.colcount > 0)) {
			P.log.write('colcounterr', 'msgerr');
			return false;
		}
		P.calc.rowcount = parseInt(P.calc.rowcount);
		if (!(P.calc.rowcount > 0)) {P.calc.rowcount = Math.floor((P.order.length - 1)/P.calc.colcount) + 1;}
		if (!(P.calc.rowcount > 0)) {
			P.log.write('rowcounterr', 'msgerr');
			return false;
		}
		if (!evaluateAspect()) {
			P.log.write('illegalwha', 'msgerr');
			return false;
		}
		P.calc.pos = [];
		for (let i=0; i<P.order.length; i++) {
			const newpos = {};
			newpos.row = Math.floor(i/P.calc.colcount);
			if (newpos.row >= P.calc.rowcount) {break;}
			newpos.col = i % P.calc.colcount;
			newpos.idx = P.order[i];
			newpos.left = P.calc.margins.left + newpos.col*(P.calc.margins.gapVertical+P.calc.singleWidth);
			newpos.top = P.calc.margins.top + newpos.row*(P.calc.margins.gapHorizontal+P.calc.singleHeight);
			newpos.width = P.calc.singleWidth;
			newpos.height = P.calc.singleHeight;
			newpos.fit = P.calc.fit;
			if (newpos.fit == 'contain') {
				newpos.save = {};
				['left', 'top', 'width', 'height'].forEach(key =>{
					newpos.save[key] = newpos[key];
				});
				switch (Math.sign(P.pics[newpos.idx].width * P.calc.singleHeight - P.pics[newpos.idx].height * P.calc.singleWidth)) {
					case 1:
						newpos.height = Math.round(P.calc.singleWidth * P.pics[newpos.idx].height / P.pics[newpos.idx].width);
						newpos.top += Math.floor((newpos.save.height-newpos.height)/2);
						break;
					case -1:
						newpos.width = Math.round(P.calc.singleHeight * P.pics[newpos.idx].width / P.pics[newpos.idx].height);
						newpos.left += Math.floor((newpos.save.width-newpos.width)/2);
						break;
				}
			}
			if (newpos.fit == 'cover') {
				switch (Math.sign(P.pics[newpos.idx].width * P.calc.singleHeight - P.pics[newpos.idx].height * P.calc.singleWidth)) {
					case 1:
						const ww = Math.round(P.pics[newpos.idx].height * P.calc.singleWidth / P.calc.singleHeight);
						newpos.clip = {
							left: Math.floor((P.pics[newpos.idx].width-ww)/2),
							top: 0,
							width: ww,
							height: P.pics[newpos.idx].height
						};
						break;
					case -1:
						hh = Math.round(P.pics[newpos.idx].width * P.calc.singleHeight / P.calc.singleWidth);
						newpos.clip = {
							left: 0,
							top: Math.floor((P.pics[newpos.idx].height-hh)/2),
							width: P.pics[newpos.idx].width,
							height: hh
						};
						break;
				}
			}
			P.calc.pos.push(newpos);
		};
		P.calc.n = P.calc.pos.length;
		P.calc.canvasWidth = P.calc.margins.left + P.calc.margins.right + (P.calc.colcount-1)*P.calc.margins.gapHorizontal + P.calc.colcount*P.calc.singleWidth;
		P.calc.canvasHeight = P.calc.margins.top + P.calc.margins.bottom + (P.calc.rowcount-1)*P.calc.margins.gapVertical + P.calc.rowcount*P.calc.singleHeight;
		P.RT.show('calculate1');
		return true;
	}

	function calculate2() {
		P.RT.start('calculate2');
		if (!(P.calc.targetWidth > 0)) {
			P.log.write('pwiderr', 'msgerr');
			return false;
		}
		if (!(P.calc.rowcount > 0 || P.calc.targetHeight > 0 || P.calc.imagesToShow > 0)) {
			P.log.write('pheighmiss', 'msgerr');
			return false;
		}
		P.calc.n = P.order.length;
		P.calc.pos = [];
		P.lookupParameters = {
			P: {
				dim: 'width', 
				pos: 'left', 
				key: 'row', 
				grid: 'rowgrid', 
				target: 'targetWidth', 
				canvas: 'canvasWidth', 
				margin1: P.calc.margins.left, 
				margin2: P.calc.margins.right, 
				gap: P.calc.margins.gapHorizontal
			}, 
			S: {
				dim: 'height', 
				pos: 'top', 
				key: 'col', 
				target: 'targetHeight', 
				canvas: 'canvasHeight', 
				margin1: P.calc.margins.top, 
				margin2: P.calc.margins.bottom, 
				gap: P.calc.margins.gapVertical
			},
			stripeCount: P.calc.rowcount
		};
		if (!evaluateStripeRatios()) {
			P.log.write('invalidwhc', 'msgerr');
			return false;
		}
		if (P.calc.rowgrid) {
			P.calc.stripeAssignments = setStripeAssignments(P.calc.rowgrid);
			P.lookupParameters.stripeCount = P.calc.rowgrid.length;
			P.calc.n = Math.min(P.calc.imagesToShow, P.order.length);
		} else {
			P.calc.stripeAssignments = optimizeSegmentationDynPro(P.calc.ratios, P.calc.nStripes);
		}

		calculateStripeParameters();
		calculateStripePositions();
		P.RT.show('calculate2');
		return true;
	}

	function calculate3() {
		P.RT.start('calculate3');
		if (!(P.calc.targetHeight > 0)) {
			P.log.write('pheighterr', 'msgerr');
			return false;
		}
		if (!(P.calc.colcount > 0 || P.calc.targetWidth > 0 || P.calc.imagesToShow > 0)) {
			P.log.write('pwidthmiss', 'msgerr');
			return false;
		}
		P.calc.n = P.order.length;
		P.calc.pos = [];
		P.lookupParameters = {
			S: {
				dim: 'width', 
				pos: 'left', 
				key: 'row', 
				target: 'targetWidth', 
				canvas: 'canvasWidth', 
				margin1: P.calc.margins.left, 
				margin2: P.calc.margins.right, 
				gap: P.calc.margins.gapHorizontal
			}, 
			P: {
				dim: 'height', 
				pos: 'top', 
				key: 'col', 
				grid: 'colgrid', 
				target: 'targetHeight', 
				canvas: 'canvasHeight', 
				margin1: P.calc.margins.top, 
				margin2: P.calc.margins.bottom, 
				gap: P.calc.margins.gapVertical
			},
			stripeCount: P.calc.colcount
		};
		if (!evaluateStripeRatios()) {
			P.log.write('invalidhwc', 'msgerr');
			return false;
		}
		console.log('calculate3:', P.calc);
		if (P.calc.colgrid) {
			P.calc.stripeAssignments = setStripeAssignments(P.calc.colgrid);
			P.lookupParameters.stripeCount = P.calc.colgrid.length;
			P.calc.n = Math.min(P.calc.imagesToShow, P.order.length);
		} else {
			P.calc.stripeAssignments = optimizeSegmentationDynPro(P.calc.ratios, P.calc.nStripes);
		}		

		calculateStripeParameters();
		calculateStripePositions();
		P.RT.show('calculate3');
		return true;
	}

	function evaluateAspect() {
//	Calculate singleHeight and singleWidth based on aspect
		P.RT.start('evaluateAspect');
		logConsole('evaluateAspect - P.calc snapshot start):', JSON.parse(JSON.stringify(P.calc)));
		if (P.calc.singleWidth > 0 && P.calc.singleHeight > 0) {return true;}
		if (P.calc.aspect == '') {P.calc.aspect = 'D';}
		P.calc.aspect = P.calc.aspect.replace(/,/g, ".");
		const parts = P.calc.aspect.split(':');
		if (parts.length == 2) {
			P.calc.aspect = parseInt(parts[0]) / parseInt(parts[1]);
		} else {
			if ((parseFloat(P.calc.aspect) > 0)) {
				P.calc.aspect = parseFloat(P.calc.aspect);
			} else {
				switch (P.calc.aspect.toLowerCase()) {
					case 'e':
						P.calc.aspect = P.pics[P.order[0]].ratio;
						break;
					case 'l':
						P.calc.aspect = P.pics[P.order[P.order.length-1]].ratio;
						break;
					case 'd':
						let n=0, s=0.0;
						P.pics.forEach(pic => {n++; s += pic.ratio;});
						P.calc.aspect = s / n;
						break;
					case 'm':
						let rr, nhi=0, rhi;
						const r = {};
						P.pics.forEach(pic => {
							rr = Math.round(pic.ratio * 1000) / 1000;
							if (rr in r) {
								r[rr]++;
							} else {
								r[rr] = 1;
							}
							if (r[rr] > nhi) {nhi = r[rr]; rhi = rr}
						});
						P.calc.aspect = rhi
						break;
				}
			}
		}
		if (P.calc.singleWidth > 0) {
			P.calc.singleHeight = Math.round(P.calc.singleWidth/P.calc.aspect);
		}
		if (P.calc.singleHeight > 0) {
			P.calc.singleWidth = Math.round(P.calc.singleHeight*P.calc.aspect);
		}
		P.RT.show('evaluateAspect');
		logConsole('evaluateAspect - P.calc snapshot end):', JSON.parse(JSON.stringify(P.calc)));
		return (P.calc.singleWidth > 0 && P.calc.singleHeight > 0);
	}

	function evaluateStripeRatios() {
//	Prepare ratio data and calculate number of poster rows
		P.RT.start('evaluateStripeRatios');
		const X = P.lookupParameters; let ratio;
		P.calc.Rpics = 0;
		P.calc.ratios = [];
		P.order.forEach(idx => {
			ratio = P.pics[idx][X.P.dim] / P.pics[idx][X.S.dim];
			P.calc.Rpics += ratio;
			P.calc.ratios.push(ratio);
			P.calc.pos.push({idx: idx, primOrig: P.pics[idx][X.P.dim], secOrig: P.pics[idx][X.S.dim], ratio: ratio, cumratio: P.calc.Rpics});
		});
		if (P.calc[X.P.target] > 0 && P.calc[X.P.grid]) {
			P.calc.nStripes = P.calc[X.P.grid].length;
		} else if (P.calc[X.P.target] > 0 && X.stripeCount > 0) {
			P.calc.nStripes = X.stripeCount;
		} else if (P.calc[X.P.target] > 0 && P.calc[X.S.target] > 0) {
			P.calc.nStripes = limiter(Math.round(Math.sqrt(P.calc.Rpics * P.calc[X.S.target] / P.calc[X.P.target])), 1, P.calc.n);
		} else {
			return false;
		}
		P.RT.show('evaluateStripeRatios');
		return true;
	}

	function setStripeAssignments(grid) {
//		Generate image assignment to stripe positions based on rowgrid or colgrid
		P.RT.start('setStripeAssignments');
		const out = []
		grid.forEach((n, idx) => {
			for (let i=0; i<n; i++) {out.push(idx);}
		});
		P.RT.show('setStripeAssignments');
		return out;
	}

	function optimizeSegmentationDynPro(data, Nseg) {
//		Split data array into Nseg segments with sum(data(i)) in each segment nearly same
//		Dynamic programming, transscript from Asymptote program by fedja
//		https://mathoverflow.net/questions/473701/
		P.RT.start('optimizeSegmentationDynPro');
		const n=data.length, m=Nseg;
		if (!n || !m || m > n) {return false;}
		if (m == 1) {return Array(n).fill(0);}
		if (m == n) {return data.keys();}
		let r=[0.0], rCum=[0.0];			// arrays indexed from 0, 1, ..., n
		data.forEach((d,i) => {r[i+1] = d; rCum[i+1] = rCum[i]+d;});
		const qqStart = 2 ** (Math.floor(Math.log(n)/Math.log(2)+1));
		F = function(t) {return 1.0/(t+0.0001*rCum[n]/n);};
		let S=[];
		for (let i=0; i<=n; i++) {S[i] = F(rCum[i]);}
		let iterationCounter=0;
		let T=[], v=[], q=[], kk=[], imin, imax, M, MM;
		for (let j=2; j<=m; j++) {
			q[0] = 0; 
			for (let qq=qqStart; qq>0; qq=Math.floor(qq/2)) {
				for (let k=qq; k<=n; k+=2*qq) {
					imin = q[k-qq];
					imax = k;
					if (k+qq <= n) {imax = Math.min(k, q[k+qq])};
					M = -1;
					for (let i=imin; i<=imax; i++) {
						iterationCounter++;
						MM = S[i] + F(rCum[k]-rCum[i]);
						if (MM < M || M < 0) {M = MM; q[k] = i;}
					}
					T[k] = M;
				}
			}
			T[0] = F(0);
			S = T.slice();
			v[j] = q.slice();
		}
		kk[0] = 0; kk[m] = n;
		for (let j=m; j>=2; j--) {kk[j-1] = v[j][kk[j]];}
		const out = []; let seg=0, nOld=0;
		kk.forEach(nn => {
			if (nn > 0) {
				for (let i=nOld; i<nn; i++) {out.push(seg);}
				seg++; nOld = nn;
			}
		});
		logConsole('optimizeSegmentationDynPro results', {
			iterationCounter: iterationCounter, 
			kk: kk, 
			out: out, 
			S: S, 
			T: T, 
			v: v
		});
		P.RT.show('optimizeSegmentationDynPro');
		return out;
	}

	function calculateStripeParameters() {
//	Scale row heights to ensure that poster targetWidth is matched
		P.RT.start('calculateStripeParameters');
		const X = P.lookupParameters;
		let i, j, nn, ww, rr;
		P.calc.stripes = [];
		P.calc.stripeImages = [];
		for (i=0; i<P.calc.nStripes; i++) {
			nn=0; ww=0, rr=0.0;
			P.calc.stripeImages[i] = [];
			const jHI = Math.min(P.calc.stripeAssignments.length, P.calc.n);
			for (j=0; j<jHI; j++) {
				if (P.calc.stripeAssignments[j] == i) {
					P.calc.stripeImages[i].push(j);
					P.calc.pos[j].primKey = i;
					P.calc.pos[j].secKey = nn;
					nn++;
					ww += P.calc.pos[j].primOrig;
					rr += P.calc.pos[j].ratio;
				}
			}
			const primSize = P.calc[X.P.target] - X.P.margin1 - X.P.margin2 - (nn-1) * X.P.gap;
			P.calc.stripes[i] = {
				n: nn, 
				primSizeOrig: ww, 
				primSize: primSize, 
				factor: primSize/ww, 
				secSize: Math.round(primSize / rr)
			};
		}
		P.RT.show('calculateStripeParameters');
	}

	function calculateStripePositions() {
//	Calculate positions and sizes of all images
		P.RT.start('calculateStripePositions');
		const X = P.lookupParameters;
		let i, primSizes, P0, S0, lastPdim, lastStripe;
//		Width and height of all images
		for (i=0; i<P.calc.nStripes; i++) {
			primSizes = [];
			P.calc.stripeImages[i].forEach(item => {primSizes.push(P.calc.stripes[i].secSize*P.calc.pos[item].primOrig/P.calc.pos[item].secOrig);});
			primSizes = scaleIntegers(primSizes, P.calc.stripes[i].primSize);
			P.calc.stripeImages[i].forEach((item, j) => {
				P.calc.pos[item][X.P.dim] = primSizes[j];
				P.calc.pos[item][X.S.dim] = P.calc.stripes[i].secSize
			});
		}
//		Positions
//		const iHI = Math.min(P.calc.stripeAssignments.length, P.calc.n);
//		(i=0; i<P.calc.pos.length; i++)
		for (i=0; i<P.calc.n; i++) {
			if (!(P.calc.pos[i].primKey === lastStripe)) {
				P0 = X.P.margin1;
				S0 = P.calc.pos[i].primKey > 0 ? S0 + X.S.gap + P.calc.stripes[lastStripe].secSize : X.S.margin1;
				lastStripe = P.calc.pos[i].primKey;
			} else {
				P0 += X.P.gap + lastPdim;
			}
			P.calc.pos[i][X.P.pos] = P0;
			P.calc.pos[i][X.S.pos] = S0;
			lastPdim = P.calc.pos[i][X.P.dim];
		}
		P.calc[X.P.canvas] = P.calc[X.P.target];
		P.calc[X.S.canvas] = S0 + P.calc.stripes[lastStripe].secSize + X.S.margin2;
		P.RT.show('calculateStripePositions');
	}

	function scaleIntegers(items, target) {
        let i, total, delta, q, out, sortidx, korr;
		total = 0; items.forEach(item => {total += item;});
		if (total <= 0) {return false;}
		q = target / total;
		out = [];
		items.forEach((item, idx) => {
            out.push({idx: idx, value: item*q, round: Math.round(item * q), diff: Math.round(item * q)-item*q}
                );
        });
		delta = -target; out.forEach(item => {delta += item.round;});
		if (delta == 0) {return arrayOfObjectsReducedByKey(out, 'round');}
		sortidx = indexSortedByValue(arrayOfObjectsReducedByKey(out, 'diff'), delta < 0);
        korr = delta > 0 ? -1 : 1;
        for (i=0; i<Math.abs(delta); i++) {
            out[sortidx[i]].round += korr;
        }
		delta = -target; out.forEach(item => {delta += item.round;});
		if (delta == 0) {return arrayOfObjectsReducedByKey(out, 'round');}
        console.warn('scaleIntegers failed fitting target - items, target:', items, target);
		return false;
	}

	function arrayOfObjectsReducedByKey(objarr, key) {
		const out=[]; objarr.forEach(obj=>{out.push(obj[key]);}); return out;
	}

	function indexSortedByValue(arr, ascending=true) {
		let res;
		const n = arr.length;
		const u = [];
		arr.forEach((value, idx) => {u.push({idx: idx, value: value});});
		res = u.sort((a, b) => {return ascending ? a.value-b.value : b.value-a.value;});
		return arrayOfObjectsReducedByKey(res, 'idx');
	}
//	============================================================
//	Miscellaneous
//	============================================================
	function getClientOS() {
		try {
			if (typeof navigator === "undefined") return "non-browser";
			const ua = navigator.userAgent || "";
			const platform = navigator.userAgentData?.platform || navigator.platform || "";
			if (/iPhone|iPad|iPod/i.test(ua) || /iPhone|iPad|iPod/i.test(platform)) return "iOS";
			if (/iPad/i.test(ua) || /iPad/i.test(platform)) return "iPadOS";
			if (/Mac/i.test(platform)) {
				if (navigator.maxTouchPoints > 1) {return "iPadOS"}
				return "macOS";
			}
			if (/Win/i.test(platform)) return "Windows";
			if (/Android/i.test(ua)) return "Android";
			if (/Linux/i.test(platform)) return "Linux";
			return "Unknown";
		} catch (err) {
			console.warn('Error getting client OS:', err);
			return 'Unable to determine client OS';
		}
	}

	function saveVariable(data) {
		const blob = new Blob([JSON.stringify(data)], {type: 'text/json'});
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = 'data.json';
		downloadLink.click();
		downloadLink.remove();
	}

	function updateFileList() {
		logConsole('updateFileList');
		const ELE = {};
		EL.filelist.innerHTML = '';
		if (P.order.length > 0) {
			ELE.h4 = createChild(EL.filelist, 'h4');
			ELE.h4.innerHTML = P.order.length + ' ' + P.messages.getmsg('imgloaded');
			ELE.info = createChild(EL.filelist, 'p');
			ELE.info.innerHTML = P.messages.getmsg('imgmoveable');
			EL.area = createChild(EL.filelist, 'div', 'filearea');
			let Number = 0
			P.order.forEach((idx, i) => {
				Number += 1
				ELE.block = createChild(EL.area, 'div', 'fileblock');
				ELE.block.setAttribute('id', 'imgorder-' + i);
				ELE.filenumber = createChild(ELE.block, 'div', 'filenumber');
				ELE.filenumber.innerHTML = Number;
				ELE.fileimg = ELE.block.appendChild(P.pics[idx].image.cloneNode(true));
				ELE.fileimg.setAttribute('class', 'fileimg');
				ELE.filename = createChild(ELE.block, 'div', 'filename');
				ELE.filename.innerHTML = P.pics[idx].file.name;

				ELE.filetitle = createChild(ELE.block, 'div', 'filetitle');
				const inputID = 'imgcap_' + idx;
				const inputEle = createChild(ELE.filetitle, 'input', {type: 'text', value: P.pics[idx].title});
				inputEle.dataset.imgidx = idx;
				inputEle.addEventListener('change', e => {
					const input = e.currentTarget;
					const idx = input.dataset.imgidx;
					P.pics[idx].title = input.value;
				});

				ELE.fileTS = createChild(ELE.block, 'div', 'fileTS');
				ELE.fileTS.innerHTML = formatTS(P.pics[idx].file.lastModified);
				ELE.filesize = createChild(ELE.block, 'div', 'filesize');
				ELE.filesize.innerHTML = formatINT(P.pics[idx].file.size) + ' Bytes';
				ELE.filepixel = createChild(ELE.block, 'div', 'filepixel');
				ELE.filepixel.innerHTML = formatINT(P.pics[idx].width) + ' * ' + formatINT(P.pics[idx].height) + ' Pixel (B * H)';
				ELE.fileremove = createChild(ELE.block, 'div', 'fileremove');
				ELE.filermvimg = createChild(ELE.fileremove, 'img');
				ELE.filermvimg.setAttribute('title', 'Bild ' + P.pics[idx].file.name + ' löschen');
				ELE.filermvimg.addEventListener('click', e => {removeImage(e, i);});
				ELE.filermvimg.src = P.res.svg.wastebasket;
			});
			P.mov = new jsf_dnd_mover('filearea', 1);
			P.mov.registerDropAction(reorderImages);
			EL.filelist.style.display = 'block';
		} else {
			EL.filelist.style.display = 'none';
		}
	}

	function removeImage(evt, i) {
		logConsole('removeImage - i, evt:', i, evt);
		if (P.order[i] || P.order[i] == 0) {
			P.order.splice(i,1);
			updateFileList();
		} else {
			console.warn('removeImage - remove failed');
		}
	}

	function reorderImages(oldID, newID) {
		logConsole('reorderImages - oldID, newID', oldID, newID);
		const results = P.mov.resultSequence().map(item => {
			const parts = item.split('-');
			return parseInt(parts[1]) || 0;
		});
		logConsole('reorderImages - ORDER alt', P.order);
		logConsole('reorderImages - MOV results', results);
		if (P.order.length == results.length) {P.order = results.slice();}
		logConsole('reorderImages - P.order nach update', P.order);
	}

	function getAllElementsWithID() {
		const E = {};
		document.querySelectorAll('*').forEach((node) => {
			if (node.id) {E[node.id] = node;}
		});
		return E;
	}

	function createChild(parentElement, tag, attrib={}, content='') {
//		Create DOM element and connect to parent
		const newEle = document.createElement(tag);
		getElement(parentElement).appendChild(newEle);
		if (typeof attrib == 'string') {
			newEle.setAttribute('class', attrib);
		} else {
			Object.entries(attrib).forEach(([k, v]) => {newEle.setAttribute(k, v);});
		}
		if (content) {newEle.innerHTML = content;}
		return newEle;
	}

	function getElement(elementID) {
//		Get element by DOM element, ID oder special tags
		if (typeof elementID === 'object' && elementID.isConnected) {return elementID;}
		if (typeof elementID === 'string' && ['html', 'head', 'body'].includes(elementID.toLowerCase())) {
			return document.getElementsByTagName(elementID)[0];
		}
		return document.getElementById(elementID);
	}

	function prepareToggleSwitch(options={}) {
		options = Object.assign({}, {
			width: 50, 
			colorON: '#40bf40', 
			colorOFF: '#9f9f9f', 
			colorbutton: '#f1f1f1',
			divCSS: ''
		}, options);
		options.id = AUX.getUID('ts');
		AUX.registerCSS(`
	.${options.id} {display: inline-block; width: ${options.width}px; height: ${options.width/2}px; ${options.divCSS}}
	.${options.id} input[type=checkbox]{top: -21px; margin: 0;height: 0; width: 0; visibility: hidden;}
	.${options.id} label {
		top: -28px; cursor: pointer; width: 100%; height: 100%;
		background: ${options.colorOFF}; display: block; border-radius: 1000px; position: relative;
	}
	.${options.id} label:after {
		content: ''; position: absolute; top: 5px; left: 5px;
		width: calc(50% - 10px); height: calc(100% - 10px);
		background: ${options.colorbutton}; border-radius: 1000px; transition: 0.3s;
	}
	.${options.id} input:checked + label {background: ${options.colorON};}
	.${options.id} input:checked + label:after {left: calc(100% - 5px); transform: translateX(-100%);}
	.${options.id} label:active:after {width: 65%;}
		`);
		return options;
	}

	function buildToggleSwitch(parentElement, options, callback=false) {
		const inputID = AUX.getUID('cb');
		const tsdiv = createChild(parentElement, 'div', options.id);
		const tsinput = createChild(tsdiv, 'input', {type: 'checkbox', id: inputID});
		const trlabel = createChild(tsdiv, 'label', {for: inputID});
		if (callback) {tsinput.addEventListener('change', callback);}
		return tsinput;
	}

	function buildSelectOptions(selectelement, options) {
		if (Array.isArray(options)) {
			options.forEach((opt) => {
				createChild(selectelement, 'option', '', opt);
			});
		}
		if (isObject(options)) {
			Object.entries(options).forEach(([key, val]) => {
				createChild(selectelement, 'option', {value: key}, val);
			});
		}
	}

	function limiter(value, lower, upper) {
		return Math.min(Math.max(value, lower), upper);
	}

	function isObject(value) {
		return value !== undefined && value !== null && typeof value === 'object' && !Array.isArray(value);
	}

	function formatTS(TS) {
		return new Date(TS).toJSON().split('.')[0].split('T').join(' ');
	}

	function formatINT(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}

	function showElements(...elments) {
		elments.forEach((ele) => {
			ele.style.display = '';
		});
	}

	function hideElements(...elments) {
		elments.forEach((ele) => {
			ele.style.display = 'none';
		});
	}

	function cleanElements(...elments) {
		elments.forEach((ele) => {
			ele.innerHTML = '';
		});
	}

//	============================================================
//	Signaling mechanism for waiting on work to be processed
//	============================================================
class waitCounter {
//	config: signal, signalstyleON, signalstyleOFF, value, valuestyle
	constructor(callbackON=false, callbackOFF=false) {
		this.counter = 0;
		this.callbackON = callbackON;
		this.callbackOFF = callbackOFF;
	}
	ON() {this.counter++; this.refresh();}
	OFF() {this.counter--; this.refresh();}
	clear() {this.counter = 0; this.refresh();}
	refresh() {
		if (this.counter > 0) {
			if (this.callbackON) {this.callbackON(this.counter);}
		} else {
			if (this.callbackOFF) {this.callbackOFF(this.counter);}
		}
	}
}
//	============================================================
//	Read files via DND or file selection dialogue
//	============================================================
class dnd_file_uploader {
//	File input via dropzone
	constructor(areaID, inputID, callback=false) {
		logConsole('dnd_file_uploader - areaID, inputID:', areaID, inputID);
		this.DT = {};
		this.droparea = getElement(areaID);
		this.dropinput = getElement(inputID);

		if (this.droparea && this.dropinput) {
			logConsole('dnd_file_uploader - droparea, dropinput', this.droparea, this.dropinput);
			this.DT = new DataTransfer();
			this.droparea.ondragover = this.droparea.ondragenter = function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				evt.dataTransfer.dropEffect = 'copy';
			};
			this.droparea.ondrop = (function(evt) {
				logConsole('droparea.ondrop - evt:', evt);
				logConsole('droparea.ondrop - evt.dataTransfer.files:', evt.dataTransfer.files);
				this.updateDT(evt.dataTransfer);
				this.dropinput.files = evt.dataTransfer.files;
				if (callback) {callback();}
				evt.stopPropagation();
				evt.preventDefault();
			}).bind(this);
			this.dropinput.onchange = (function(evt) {
				logConsole('dropinput.onchange - evt:', evt);
				logConsole('dropinput.onchange - files:', this.dropinput.files);
				this.updateDT(this.dropinput);
				if (callback) {callback();}
			}).bind(this);
		}
	}
	addDTitem(item) {
//	Add item in DataTransfer object
		logConsole('addDTitem - item:', item);
		const filename = item.name;
		for (let i=0; i<this.DT.files.length; i++) {
			if (this.DT.files[i].name == filename) {
				logConsole('addDTitem duplicate filename - DT[i]:', this.DT.files[i]);
				return false;
			}
		}
		this.DT.items.add(item);
	}
	removeDTitem(idx) {
//	Remove item from DataTransfer object and refresh callback
		logConsole('removeDTitem - idx:', idx);
		this.DT.items.remove(idx);
		if (this.metadata) {this.getMetadata(this.metadata);}
		if (this.callback) {this.callback(this.DT);}
	}
	updateDT(source) {
//	Update DT adding files for multi or replacing the file for single
		logConsole('updateDT - source', source);
		for (let i=0; i<source.files.length; i++) {
			this.addDTitem(source.files[i]);
		}
	}
}
//	============================================================
//	Display log messages
//	============================================================
class logmessage_manager {
//	Log messages with timeout
	constructor(message_element_or_id, options) {
		this.options = Object.assign({
			messages: false, 
			console: false, 
			timeout: 0, 
			prefix: 'log-'
		}, options);
		this.msgid = 0;
		this.area = getElement(message_element_or_id);
	}
	write(content, cls='', tag='div') {
		this.msgid++;
		if (this.options.console) {
			console.log('logmessage', this.msgid, '-', content, ':', this.getContent(content));
		}
		const id = this.options.prefix + this.msgid;
		const cl = cls ? ' class="' + cls + '"' : '';
		this.area.innerHTML = '<' + tag + cl + ' id="' + id + '">' + this.getContent(content) + '</' + tag + '>' + this.area.innerHTML;
		if (this.options.timeout > 0) {
			window.setTimeout(() => {
				const logele = document.getElementById(id);
				if (logele) {logele.remove();}
			}, 1000 * this.options.timeout);
		}
	}
	getContent(content) {
		return this.options.messages ? this.options.messages(content) : content;
	}
	clear() {
		this.area.innerHTML = '';
	}
}

	function logConsole(...msg) {
//		Log messages on console, if LOG is defined and true
		if (typeof LOG !== 'undefined' && LOG) {console.log(...msg);}
	}

//	============================================================
//	General helpers
//	============================================================
class auxiliaryHelpers {
	constructor() {
		this.FTC = [];
		this.CSS = false;
		this.UID = {};
	}
	firstTimeCalled(keyword) {
		if (this.FTC.includes(keyword)) {return false;}
		if(typeof keyword === 'string' && keyword != '')  {
			this.FTC.push(keyword);
			return true;
		}
		return false;
	}
	registerCSS(CSStext) {
		if (this.CSS === false) {
			this.CSS = createChild('head', 'style');
		}
		if(typeof CSStext === 'string') {
			this.CSS.innerHTML += CSStext;
		}
	}
	getUID(label) {
		label = String(label);
		if (!(label in this.UID)) {this.UID[label] = 0;}
		this.UID[label]++;
		return label + this.UID[label];
	}
}

//	============================================================
//	Measurement of runtimes
//	============================================================
class runtime_measurement {
	constructor(options={}) {
		this.options = Object.assign({
			console: false
		}, options);
		this.data = {};
	}
	start(label=false) {
		if (!label) {return false;}
		this.data[label] = performance.now();
	}
	show(label=false) {
		if (!label) {return false;}
		if (!(label in this.data)) {return false;}
		const delta = performance.now() - this.data[label];
		if (this.options.console) {
			console.log(this.showtime(delta, 'runtime - ' + label + ': '));
		}
		return delta;
	}
	showtime(time, lead=' ') {
		const atime = Math.abs(time);
		if (atime <1000 ) {
			return lead + time.toFixed(1) + ' ms';
		}
		time /= 1000.0;
		return lead + time.toPrecision(4) + ' s';
	}
}

//	============================================================
//	Change order sequence by DND of elements
//	============================================================
class jsf_dnd_mover {
//	Move elements by drag-and-drop (e.g. ordering of objects)
	constructor(mover_class='moveable', mover_attribute=1, mover_tag='div') {
		this.mover_class = mover_class;
		this.mover_attribute = mover_attribute;
		this.mover_tag = mover_tag;
		this.dropAction = false;
		const items = document.querySelectorAll('.' + mover_class + ' > ' + mover_tag);
		items.forEach(item => {
			item.setAttribute('draggable', true);
			item.setAttribute('x-dndmover', mover_attribute);
			if (!item.id) {item.id = this.uniqueElementID('dndmover_');}
			item.addEventListener('dragstart', this.dragStart.bind(this));
			item.addEventListener('drop', this.dropped.bind(this));
			item.addEventListener('dragenter', this.cancelDefault);
			item.addEventListener('dragover', this.cancelDefault);
		});
	}
	registerDropAction(dropAction=false) {
		this.dropAction = dropAction;
	}
	dragStart(e) {
		const index = this.getIDofTarget(e.target);
		e.dataTransfer.setData('text/plain', index);
	}
	dropped(e) {
		this.cancelDefault(e);

		const oldID = e.dataTransfer.getData('text/plain');
		const dropped = document.getElementById(oldID);
		const newID = this.getIDofTarget(e.target);
		const newTarget = document.getElementById(newID);

		if (!dropped) {return false;}
		if (dropped.getAttribute('x-dndmover') != newTarget.getAttribute('x-dndmover')) {return false;}

		if (this.childIndex(newID) < this.childIndex(oldID)) {
			newTarget.before(dropped);
		} else {
			newTarget.after(dropped);
		}
		
		if (this.dropAction) {this.dropAction(oldID, newID);}
	}
	cancelDefault(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}	
	childIndex(nodeID) {
		const children = document.getElementById(nodeID).parentNode.childNodes;
		for (let i=0; i<children.length; i++) {
			if (children[i].id == nodeID) {return i;}
		}
		return -1;
	}
	getIDofTarget(node) {
		do {
			if (node.getAttribute('x-dndmover') == this.mover_attribute) {
				return node.id ? node.id : false;
			}
			node = node.parentNode;
			if (!node) {return false;}
		}
		while (node.isConnected);
		return false;
	}
	uniqueElementID(prefix='id_') {
		let uniqueID = '';
		do {
			uniqueID = prefix + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		while (document.getElementById(uniqueID));
		return uniqueID;
	}
	resultSequence() {
		const out = [];
		const movers = document.getElementsByClassName(this.mover_class);
		for (let i=0; i < movers.length; i++) {
			const children = movers[i].getElementsByTagName(this.mover_tag);
			for (let j=0; j < children.length; j++) {
				if (children[j].id) {out.push(children[j].id);}
			}
		}
		return out;
	}
}

//	============================================================
//	Language Support
//	============================================================
class language_support {
	constructor(options={}, ...messages) {
		this.options = Object.assign({
			lang: 'en',
			defaultlang: 'en',
			supportedLanguages: []
		}, options);
		this.msgdata = {};
		if (messages) {this.load(...messages);}
	}
	load(...messages) {
		this.msgdata = Object.assign({}, ...messages);
		this.determineSupportedLanguages();
	}
	merge(...messages) {
		this.msgdata = Object.assign(this.msgdata, ...messages);
		this.determineSupportedLanguages();
	}
	setLanguage(lang) {
		if (this.options.supportedLanguages.includes(lang)) {
			this.options.lang = lang;
		}
	}
	getmsg(msgkey) {
		if (this.msgdata[msgkey]?.[this.options.lang]) {return this.msgdata[msgkey][this.options.lang];}
		if (this.msgdata[msgkey]?.[this.options.defaultlang]) {return this.msgdata[msgkey][this.options.defaultlang];}
		return msgkey;
	}
	determineSupportedLanguages() {
		this.options.supportedLanguages = [...new Set(Object.values(this.msgdata).flatMap(innerObj => Object.keys(innerObj)))];
	}
}

//	Language Texts (to be updates from .md file)
	function setupLanguageTextElements() {
		return {
			'noimgsel': {en: 'no picture files selected', de: 'Keine Bilder zum Laden ausgewählt'},
			'zerowh': {en: 'Selection contains images with zero width or height', de: 'Auswahl enthält Bild mit Breite oder Höhe von Null'},
			'imgloaderr': {en: 'Error loading image', de: 'Fehler beim Laden des Bildes'},
			'posgenerr': {en: 'Poster generation failed', de: 'Postererstellung mit Fehler beendet'},
			'wincreafail': {en: 'Error creating output window', de: 'Fehler beim Erzeugen des Ausgabefensters'},
			'calcfail': {en: 'Calculation failed', de: 'Berechnung mit Fehler beendet'},
			'colcounterr': {en: 'Illegal parameter column count', de: 'Unzulässiger Parameter bei Anzahl Spalten'},
			'rowcounterr': {en: 'Illegal parameter row count', de: 'Unzulässiger Parameter bei Anzahl Zeilen'},
			'illegalwha': {en: 'Illegal parameters for width, height or aspect', de: 'Unzulässige Parameter bei Einzelbild Breite, Höhe oder Seitenverhältnis'},
			'pwiderr': {en: 'Invalid poster width', de: 'Unzulässige Poster-Breite'},
			'pheighmiss': {en: 'Poster height, count of horizontal stripes or images per row are mandatory', de: 'Poster-Höhe, Anzahl horizontaler Streifen oder Bilder pro Zeile müssen angegeben werden'},
			'invalidwhc': {en: 'Invalid parameters for width, height or count of stripes', de: 'Unzulässige Parameter bei Breite, Höhe oder Anzahl Streifen'},
			'pheighterr': {en: 'Invalid poster height', de: 'Unzulässige Poster-Höhe'},
			'pwidthmiss': {en: 'Poster width, count of vertical stripes or images per column are mandatory', de: 'Poster-Breite, Anzahl vertikaler Streifen oder Bilder pro Spalte müssen angegeben werden'},
			'invalidhwc': {en: 'Invalid parameters for height, width or count of stripes', de: 'Unzulässige Parameter bei Höhe, Breite oder Anzahl Streifen'},
			'postergen': {en: 'poster generated', de: 'Poster erzeugt'},
			'calcdone': {en: 'calculation done', de: 'Berechnung erfolgt'},
			'imgloaded': {en: 'images loaded', de: 'Bilder geladen'},
			'imgmoveable': {en: 'The sequence of images can be changed by drag and drop', de: 'Die Reihenfolge der Bilder kann durch Verschieben geändert werden'},
			'imgselected': {en: 'images selected', de: 'Bilder ausgewählt'},
			'heicfail': {en: 'HEIC conversion failed', de: 'HEIC Konvertierung mit Fehler beendet'},
			'h0': {en: 'Poster Generator', de: 'Poster Generator'},
			'l_language': {en: 'Language', de: 'Sprache'},
			'h1': {en: '1. Select Images', de: '1. Bilder auswählen'},
			'j1': {en: 'Drag images here<br/>or click for file selection dialogue', de: 'Fotos hierhin ziehen<br/>oder klicken zum Dateiauswahldialog'},
			'b1': {en: 'Delete Selection', de: 'Auswahl löschen'},
			'a1': {en: 'Help', de: 'Hilfe'},
			'h2': {en: '1. Load Images', de: '1. Bilder laden'},
			'b2': {en: 'Load Images', de: 'Bilder laden'},
			'b3': {en: 'Remove Images', de: 'Bilder löschen'},
			'h3': {en: '2. Select Poster Type', de: '2. Poster-Typ festlegen'},
			'pt1': {en: 'Grid', de: 'Raster'},
			'pt2': {en: 'Stripes horizontal', de: 'Streifen horizontal'},
			'pt3': {en: 'Stripes vertical', de: 'Streifen vertikal'},
			'h4': {en: '3. Select Output Format', de: '3. Ausgabeformat festlegen'},
			'ot1': {en: 'Canvas', de: 'Canvas'},
			'ot2': {en: 'HTML', de: 'HTML'},
			'h5': {en: '4. Poster Parameters', de: '4. Poster Parameter'},
			'l_colcount1': {en: 'Column count', de: 'Anzahl Spalten'},
			'l_rowcount1': {en: 'Row count', de: 'Anzahl Zeilen'},
			'l_singleWidth1': {en: 'Width of single image', de: 'Einzelbild Breite'},
			'l_singleHeight1': {en: 'Height of single image', de: 'Einzelbild Höhe'},
			'l_aspect1': {en: 'Aspect ratio (W:H)', de: 'Seitenverhältnis (B:H)'},
			'l_crop1': {en: 'Crop options:', de: 'Zuschnitt:'},
			'l_fit11': {en: 'contain (margins may occur)', de: 'Originalverhältnis (ggf. mit Rand)'},
			'l_fit12': {en: 'fill (distortions possible)', de: 'Ausfüllen (ggf. mit Verzerrung)'},
			'l_fit13': {en: 'cover (centered)', de: 'Ausschnitt (mittenzentriert)'},
			'l_targetWidth2': {en: 'Specified poster width', de: 'Vorgegebene Poster-Breite'},
			'l_targetHeight2': {en: 'Desired poster height (approx.)', de: 'Gewünschte Poster-Höhe (ca.)'},
			'l_rowcount2': {en: 'Count of horizontal stripes', de: 'Anzahl horizontaler Streifen'},
			'l_rowgrid2': {en: 'Images per row (n1, n2, ... nn or n * m)', de: 'Bilder pro Zeile (n1, n2, ... nn oder n * m)'},
			'l_targetHeight3': {en: 'Specified poster height', de: 'Vorgegebene Poster-Höhe'},
			'l_targetWidth3': {en: 'Desired poster width (approx.)', de: 'Gewünschte Poster-Breite (ca.)'},
			'l_colcount3': {en: 'Count of vertical stripes', de: 'Anzahl vertikaler Streifen'},
			'l_colgrid3': {en: 'Images per column (n1, n2, ... nn or n * m', de: 'Bilder pro Spalte (n1, n2, ... nn)'},
			'l_margins': {en: 'Margins (t, r, b, l)', de: 'Posterränder (o, r, u, l)'},
			'l_gaps': {en: 'Gap (hor., vert.)', de: 'Bildzwischenraum (hor., vert.)'},
			'l_bgcol': {en: 'Background color', de: 'Hintergrundfarbe'},
			'l_bgimg': {en: 'Background image', de: 'Hintergrundbild'},
			'l_imcap': {en: 'Image captions', de: 'Bildtitel'},
			'l_singleimage': {en: 'Single image:', de: 'Einzelbild:'},
			'l_borderwidth': {en: 'Border width', de: 'Rahmenstärke'},
			'l_borderdash': {en: 'Border style', de: 'Rahmenmuster'},
			'borderstyle1': {en: 'none', de: 'kein Rahmen'},
			'borderstyle2': {en: 'solid', de: 'Linie'},
			'borderstyle3': {en: 'dotted', de: 'Punkte'},
			'borderstyle4': {en: 'dashed', de: 'gestrichelt'},
			'borderstyle5': {en: 'double', de: 'Doppellinie'},
			'borderstyle6': {en: 'groove', de: 'Rille'},
			'borderstyle7': {en: 'ridge', de: 'Steg'},
			'borderstyle8': {en: 'inset', de: 'eingebettet'},
			'borderstyle9': {en: 'outset', de: 'aufgesetzt'},
			'l_borderstyle': {en: 'Border style', de: 'Rahmenstil'},
			'l_bordercolor': {en: 'Border color', de: 'Rahmenfarbe'},
			'l_corner': {en: 'Border radius', de: 'Eckenrundung'},
			'l_postername': {en: 'Poster Name', de: 'Postername'},
			'l_filetype': {en: 'Image file type', de: 'Ausgabedateityp'},
			'l_quality': {en: 'Quality (jpeg)', de: 'Ausgabequalität (jpeg)'},
			'h6': {en: '5. Generate Poster', de: '5. Poster erstellen'},
			'pw2': {en: 'Show Poster', de: 'Poster anzeigen'},
			'pw3': {en: 'Save Poster', de: 'Poster speichern'},
			'j81': {en: 'Drag background image here<br/>or click for file selection dialogue', de: 'Hintergrundbild hierhin ziehen<br/>oder klicken zum Dateiauswahldialog'},
			'bgimgtransform1': {en: 'no transform', de: 'keine Anpassung'},
			'bgimgtransform2': {en: 'fill (distortions possible)', de: 'Ausfüllen (ggf. mit Verzerrung)'},
			'bgimgtransform3': {en: 'proportional (no distorsion)', de: 'Proportional (ohne Verzerrung)'},
			'l_bgimgtransform': {en: 'Image transformation', de: 'Bildanpassung'},
			'l_bgimgpos': {en: 'Positioning (LCR, TCB)', de: 'Positionierung (LMR, OMU)'},
			'l_bgimgopacity': {en: 'Opacity (0: transparent, 1: no see-through)', de: 'Opazität (0: transparent, 1: undurchsichtig)'},
			'titlefontfamily0': {en: 'select font family', de: 'Font auswählen'},
			'l_titlefontfamily': {en: 'Font Family', de: 'Schriftart'},
			'l_titlefontsize': {en: 'Font size (px)', de: 'Schriftgröße (px)'},
			'l_titlecolor': {en: 'Color', de: 'Schriftfarbe'},
			'l_titlecolorstroke': {en: 'Stroke color', de: 'Schriftkantenfarbe'},
			'l_titlestrokewidth': {en: 'Stroke width', de: 'Schriftkantenstärke'},
			'l_titlepos': {en: 'Positioning of image titles', de: 'Positionierung Bildtitel'},
			'l_titletextanchor': {en: 'Text anchor (L/C/R T/C/B)', de: 'Textanker (L/M/R O/M/U)'},
			'l_titleimageanchor': {en: 'Image anchor (L/C/R T/C/B)', de: 'Bildanker (L/M/R O/M/U)'},
			'l_titledistances': {en: 'Offsets (hor. px, vert. px)', de: 'Abstände (hor. px, vert. px)'},
			'l_titleangle': {en: 'Text Angle (degrees)', de: 'Textwinkel (°)'},
			'fontmodedefault': {en: 'Default fonts', de: 'Standard Fonts'},
			'fontmodeall': {en: 'All system fonts', de: 'Alle Fonts'},
			'l_titleusefilename': {en: 'Use filename as caption', de: 'Dateiname als Bildtitel'},
			'nothingtodownload': {en: 'nothing to download', de: 'Kein Poster zum Download verfügbar'}
		};
	}
