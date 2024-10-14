/*
	poster.js
	Poster Generator
	2023-08-17 RannerDesign
	Combine multiple images into one poster image and download jpg
	v2.1.1	2024-06-01	New design with 3 structural options
	v2.1.2	2024-06-19	Performance optimization
	v2.1.4	2024-06-25	Stripe optimization by algorithm from fedja
	v2.1.5	2024-06-27	Calculation no longer separate step
	v2.1.6	2024-07-01	Bug fixes
	v2.2.1	2024-10-12	Preset rows for stripes
*/
	var EL, P, LOG;
	document.addEventListener('DOMContentLoaded', posterInit);
//	------------------------------------------------------------
//	Initialization
//	------------------------------------------------------------
	function posterInit() {
		P = {};
		P.programVersion = 'Poster Generator v2.2.1';
		P.lang = document.documentElement.lang ? document.documentElement.lang : 'en';
		EL = getAllElementsWithID();
		presetElements();
		defineWaitCounters();
		P.res = loadResources();
		P.messages = new language_support({lang: P.lang});
		P.messages.load(defineMessages());
		LOG = true;										// Enable console.log output
		P.RT = new runtime_measurement({console: true});
		P.log = new logmessage_manager(EL.messagearea, {timeout: 60, console: true, messages: msgkey => {return P.messages.getmsg(msgkey);}});
		P.uploader = new dnd_file_uploader('uploadfilearea', 'imgfile', monitorInput);
		P.timeout = 500;
		clearData();
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
//	------------------------------------------------------------
//	Button: Delete photo selection
//	------------------------------------------------------------
	function clearInput() {
		EL.imgfile.value = '';
		monitorInput();
	}
//	------------------------------------------------------------
//	Button: Load images
//	------------------------------------------------------------
    function loadImage() {
		const nPics2load = EL.imgfile.files.length;
		if (nPics2load < 1) {
			P.log.write('noimgsel', 'msgerr');
			return false;
		}
		let nPic = P.pics.length;
		Array.from(EL.imgfile.files).forEach(inputfile => {
			if (LOG) {console.log('loadImage - inputfile', inputfile);}
			P.waitload.ON();
			let idx = 0 + nPic++;
			P.pics[idx] = {file: inputfile};
			P.order.push(idx);
			const fr = new FileReader();
			fr.onload = e => {
				if (LOG) {console.log('FileReader loaded - fr', fr);}
				const img = new Image();
				img.onload = e => {
					if (LOG) {console.log('Image loaded - img.length', img.src.length);}
					if (img.width > 0 && img.height > 0) {
						P.pics[idx].image = img;
						P.pics[idx].width = img.width;
						P.pics[idx].height = img.height;
						P.pics[idx].ratio = img.width / img.height;
//						if (LOG) {console.log('Image loaded - P.pics[idx]', P.pics[idx]);}
					} else {
						P.pics[idx].image = false;
						P.log.write('zerowh', 'msgerr');
						console.warn('loadImage - Empty image not loaded - idx, img', idx, img);
					}
					P.waitload.OFF();
				};
				img.src = fr.result;
			};
			fr.readAsDataURL(inputfile);
		});
		EL.imgfile.value = '';
		monitorInput();
    }
//	------------------------------------------------------------
//	Button: Delete loaded images
//	------------------------------------------------------------
	function clearData() {
		P.order = [];
		P.pics = [];
		EL.imgfile.value = '';
		if (EL.ctx) {EL.ctx.clearRect(0, 0, EL.canvas.width, EL.canvas.height);}
		P.waitload.clear();
		EL.filelist.innerHTML = '';
		P.log.clear();
		monitorInput();
	}
//	------------------------------------------------------------
//	Button: Poster type
//	------------------------------------------------------------
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
		if (P.posterType != oldType) {P.calc = {};}
	}
//	------------------------------------------------------------
//	Button: Output type
//	------------------------------------------------------------
	function setOutputType(type) {
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
	}
//	------------------------------------------------------------
//	Button: Generate poster
//	------------------------------------------------------------
	function makePoster() {
		if (!calculate()) {return false;}
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
		let border;
		P.calc.windowWidth = P.calc.canvasWidth + 6;			// adjustment by
		P.calc.windowHeight = P.calc.canvasHeight - 10;			// trial and error
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
		return true;
	}

	function makeNoCanvas() {
		let divele, imgele, picnum = 1;
		P.calc.windowWidth = P.calc.canvasWidth + 6;			// adjustment by
		P.calc.windowHeight = P.calc.canvasHeight - 10;			// trial and error
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
		HTelementChild(P.nocanWindow.document.body, 'div', '', {}, {id: 'modalPic', class: 'modimg'});
		HTelementChild(P.nocanWindow.document.body, 'script', "document.body.addEventListener('keydown', keyAction);");
		return true;
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
//	------------------------------------------------------------
//	NoCanvas window special functions
//	------------------------------------------------------------
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
//	------------------------------------------------------------
//	Calculation
//	------------------------------------------------------------
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
		let key;
		const pt = P.posterType.toString();
		const ptL = pt.length;
		P.calc = {};
		
		EL['pp0'].querySelectorAll('input').forEach((input) => {
			switch(input.type) {
				case 'radio':
					key = input.checked ? input.name : false; break;
				default:
					key = input.id;
			}
			if (key) {P.calc[key] = input.value;}			
		});
		EL['pp0'].querySelectorAll('select').forEach((sel) => {
			key = sel.id;
			if (key) {P.calc[key] = sel.value;}			
		});

		EL['pp' + pt].querySelectorAll('input').forEach((input) => {
			switch(input.type) {
				case 'radio':
					key = input.checked ? input.name : false; break;
				default:
					key = input.id;
			}
			if (key) {key = key.slice(-ptL) == pt ? key.slice(0, -ptL) : false;}
			if (key) {P.calc[key] = input.value;}			
		});
		EL['pp' + pt].querySelectorAll('select').forEach((sel) => {
			key = sel.id;
			if (key) {P.calc[key] = sel.value;}			
		});

		if (P.calc.margins) {
			const marginValue = P.calc.margins;
			P.calc.margins = {};
			marginSplit(marginValue, P.calc.margins, ['top', 'right', 'bottom', 'left']);
		} else {
			P.calc.margins = {};
		}
		marginSplit(P.calc.gaps, P.calc.margins, ['gapHorizontal', 'gapVertical']);

		['colcount', 'rowcount', 'singleWidth', 'singleHeight', 'targetWidth', 'targetHeight', 'borderwidth', 'corner'].forEach(key => {
			P.calc[key] = parseInt(P.calc[key] || 0);
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
		P.calc.quality = parseFloat(P.calc.quality.replace(',', '.'));
		if (!(P.calc.quality > 0.0 && P.calc.quality <= 1.0)) {
			P.calc.quality = 0.9;
			EL.quality.value = 0.9;
		}
		if (LOG) {console.log('getDialogueParameters - P.calc:', P.calc);}
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

	function marginSplit(margins, outobj, params) {
//	Handle data entry for margins and gaps
		const M = margins.split(',').map(m => parseInt(m));
		switch (M.length) {
			case 1:
				params.forEach(p => {outobj[p] = M[0];});
				return true;
			case 2:
				params.forEach((p, i) => {outobj[p] = M[i%2];});
				return true;
			case 3:
				const J = [0, 1, 2, 1];
				params.forEach((p, i) => {outobj[p] = M[J[i%4]];});
				return true;
			case 4:
				params.forEach((p, i) => {outobj[p] = M[i%4];});
				return true;
		}
		return false;
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
		if (LOG) {console.log('optimizeSegmentationDynPro results', {
			iterationCounter: iterationCounter, 
			kk: kk, 
			out: out, 
			S: S, 
			T: T, 
			v: v
		});}
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
//	------------------------------------------------------------
//	Button: Save poster
//	------------------------------------------------------------
	function posterOut() {
		switch (P.outputType) {
			case 1:
				return canvasOut();
			case 2:
				return DOM2jpegOut();
		}
	}

	function canvasOut() {
		if (EL.canvas && EL.ctx && P.canwindow.name == P.posterWindowName) {
			P.waitload.clear();
			const canvasUrl = EL.canvas.toDataURL('image/jpeg', P.calc.quality);
			const downloadLink = document.createElement('a');
			downloadLink.href = canvasUrl;
			downloadLink.download = P.posterWindowName + '.jpg';
			downloadLink.click();
			downloadLink.remove();
			return true;
		} else {return false;}
	}

	function DOM2jpegOut() {
		if (LOG) {console.log('... starting DOM2jpegOut ...');}
		if (EL.nocanvas && P.nocanWindow.name == P.posterWindowName){
			P.waitload.clear();
			const render = node => {
				if (LOG) {console.log('... starting render - node:', node);}
				domtoimage.toJpeg(node, { quality: P.calc.quality })
				.then(dataUrl => {
					P.RT.show('DOM2jpegOut end');
					const img = new Image();
					img.src = dataUrl;
					var link = document.createElement('a');
					link.download = P.posterWindowName + '.jpg';
					link.href = dataUrl;
					link.click();
	//				document.body.appendChild(img);
				})
				.catch(error =>
					console.error('oops, something went wrong!', error)
				);
			}
			P.RT.start('DOM2jpegOut');
			render(EL.nocanvas);
		}
	}
//	------------------------------------------------------------
//	Miscellaneous
//	------------------------------------------------------------
	function saveVariable(data) {
		const blob = new Blob([JSON.stringify(data)], {type: 'text/json'});
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = 'data.json';
		downloadLink.click();
		downloadLink.remove();
	}

	function updateFileList() {
		if (LOG) {console.log('updateFileList');}
		const ELE = {};
		EL.filelist.innerHTML = '';
		if (P.order.length > 0) {
			ELE.h4 = createChild(EL.filelist, 'h4');
			ELE.h4.innerHTML = P.order.length + ' Bilder geladen';
			ELE.info = createChild(EL.filelist, 'p');
			ELE.info.innerHTML = 'Die Reihenfolge der Bilder kann durch Verschieben geändert werden';
			EL.area = createChild(EL.filelist, 'div', 'filearea');
			P.order.forEach((idx, i) => {
				ELE.block = createChild(EL.area, 'div', 'fileblock');
				ELE.block.setAttribute('id', 'imgorder-' + i);
				ELE.fileimg = ELE.block.appendChild(P.pics[idx].image.cloneNode(true));
				ELE.fileimg.setAttribute('class', 'fileimg');
				ELE.filename = createChild(ELE.block, 'div', 'filename');
				ELE.filename.innerHTML = P.pics[idx].file.name;
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
		if (LOG) {console.log('removeImage - i, evt:', i, evt);}
		if (P.order[i] || P.order[i] == 0) {
			P.order.splice(i,1);
			updateFileList();
		} else {
			console.warn('removeImage - remove failed');
		}
	}

	function reorderImages(oldID, newID) {
		if (LOG) {console.log('reorderImages - oldID, newID', oldID, newID);}
		const results = P.mov.resultSequence().map(item => {
			const parts = item.split('-');
			return parseInt(parts[1]) || 0;
		});
		if (LOG) {console.log('reorderImages - ORDER alt', P.order);}
		if (LOG) {console.log('reorderImages - MOV results', results);}
		if (P.order.length == results.length) {P.order = results.slice();}
		if (LOG) {console.log('reorderImages - P.order nach update', P.order);}
	}

	function getAllElementsWithID() {
		const E = {};
		document.querySelectorAll('*').forEach((node) => {
			if (node.id) {E[node.id] = node;}
		});
		return E;
	}

	function createChild(parent, tag, attrib={}) {
		const newEle = document.createElement(tag);
		parent.appendChild(newEle);
		if (typeof attrib == 'string') {
			newEle.setAttribute('class', attrib);
		} else {
			Object.entries(attrib).forEach(([k, v]) => {newEle.setAttribute(k, v);});}
		return newEle;
	}

	function limiter(value, lower, upper) {
		return Math.min(Math.max(value, lower), upper);
	}

	function formatTS(TS) {
		return new Date(TS).toJSON().split('.')[0].split('T').join(' ');
	}

	function formatINT(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}

	function monitorInput() {
		const nInput = EL.imgfile.files.length;
		if (nInput > 0) {
			EL.inputcount.innerHTML = nInput;
			EL.inputlist.innerHTML = '';
			createChild(EL.inputlist, 'h4').innerHTML = nInput + ' Bilder ausgewählt';
			const ul = createChild(EL.inputlist, 'ul');
			Array.from(EL.imgfile.files).forEach(inputfile => {
				createChild(ul, 'li').innerHTML = inputfile.name;
			});
			EL.inputlist.style.display = 'block';
		} else {
			EL.inputcount.innerHTML = '';
			EL.inputlist.innerHTML = '';
			EL.inputlist.style.display = 'none';
		}
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
		if (LOG) {console.log('dnd_file_uploader - areaID, inputID:', areaID, inputID);}
		this.DT = {};
		this.droparea = document.getElementById(areaID);
		this.dropinput = document.getElementById(inputID);

		if (this.droparea && this.dropinput) {
			if (LOG) {console.log('dnd_file_uploader - droparea, dropinput', this.droparea, this.dropinput);}
			this.DT = new DataTransfer();
			this.droparea.ondragover = this.droparea.ondragenter = function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				evt.dataTransfer.dropEffect = 'copy';
			};
			this.droparea.ondrop = (function(evt) {
				if (LOG) {console.log('droparea.ondrop - evt:', evt);}
				if (LOG) {console.log('droparea.ondrop - evt.dataTransfer.files:', evt.dataTransfer.files);}
				this.updateDT(evt.dataTransfer);
				this.dropinput.files = evt.dataTransfer.files;
				if (callback) {callback();}
				evt.stopPropagation();
				evt.preventDefault();
			}).bind(this);
			this.dropinput.onchange = (function(evt) {
				if (LOG) {console.log('dropinput.onchange - evt:', evt);}
				if (LOG) {console.log('dropinput.onchange - files:', this.dropinput.files);}
				this.updateDT(this.dropinput);
				if (callback) {callback();}
			}).bind(this);
		}
	}
	addDTitem(item) {
//	Add item in DataTransfer object
		if (LOG) {console.log('addDTitem - item:', item);}
		const filename = item.name;
		for (let i=0; i<this.DT.files.length; i++) {
			if (this.DT.files[i].name == filename) {
				if (LOG) {console.log('addDTitem duplicate filename - DT[i]:', this.DT.files[i]);}
				return false;
			}
		}
		this.DT.items.add(item);
	}
	removeDTitem(idx) {
//	Remove item from DataTransfer object and refresh callback
		if (LOG) {console.log('removeDTitem - idx:', idx);}
		this.DT.items.remove(idx);
		if (this.metadata) {this.getMetadata(this.metadata);}
		if (this.callback) {this.callback(this.DT);}
	}
	updateDT(source) {
//	Update DT adding files for multi or replacing the file for single
		if (LOG) {console.log('updateDT - source', source);}
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
		this.area = this.getElement(message_element_or_id);
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
				document.getElementById(id).remove();
			}, 1000 * this.options.timeout);
		}
	}
	getContent(content) {
		return this.options.messages ? this.options.messages(content) : content;
	}
	getElement(elementID) {
		if (typeof elementID === 'object' && elementID.isConnected) {return elementID;}
		if (typeof elementID === 'string' && ['html', 'head', 'body'].includes(elementID.toLowerCase())) {
			return document.getElementsByTagName(elementID)[0];
		}
		return document.getElementById(elementID);
	}
	clear() {
		this.area.innerHTML = '';
	}
}
//	------------------------------------------------------------
//	Language Support
//	------------------------------------------------------------
class language_support {
	constructor(options) {
		this.options = Object.assign({
			lang: 'en',
			defaultlang: 'en'
		}, options);
		this.msgdata = {};
	}
	load(messages) {this.msgdata = Object.assign({}, messages);}
	setlanguage(lang) {this.options.lang = lang;}
	getmsg(msgkey) {
		if (this.msgdata[msgkey]?.[this.options.lang]) {return this.msgdata[msgkey][this.options.lang];}
		if (this.msgdata[msgkey]?.[this.options.defaultlang]) {return this.msgdata[msgkey][this.options.defaultlang];}
		return msgkey;
	}
}
	function defineMessages() {
		return {
			'noimgsel': {en: 'no picture files selected', de: 'Keine Bilder zum Laden ausgewählt'},
			'zerowh': {en: 'Selection contains images with zero width or height', 
					de: 'Auswahl enthält Bild mit Breite oder Höhe von Null'},
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
			'': {en: 'Poster width or count of vertical stripes are mandatory', de: 'Poster-Breite oder Anzahl vertikaler Streifen müssen angegeben werden'},
			'pwidthmiss': {en: '', de: ''},
			'invalidhwc': {en: 'Invalid parameters for height, width or count of stripes', de: 'Unzulässige Parameter bei Höhe, Breite oder Anzahl Streifen'},
			'postergen': {en: 'poster generated', de: 'Poster erzeugt'},
			'calcdone': {en: 'calculation done', de: 'Berechnung erfolgt'}
		};
	}
//	============================================================
//	Runtime measurement
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
//	DOM-to-image
//	============================================================
/*	dom-to-image 10-06-2017 (c) 2015 Anatolii Saienko, MIT License
	https://github.com/tsayen/dom-to-image						*/
!function(a){"use strict";function b(a,b){function c(a){return b.bgcolor&&(a.style.backgroundColor=b.bgcolor),b.width&&(a.style.width=b.width+"px"),b.height&&(a.style.height=b.height+"px"),b.style&&Object.keys(b.style).forEach(function(c){a.style[c]=b.style[c]}),a}return b=b||{},g(b),Promise.resolve(a).then(function(a){return i(a,b.filter,!0)}).then(j).then(k).then(c).then(function(c){return l(c,b.width||q.width(a),b.height||q.height(a))})}function c(a,b){return h(a,b||{}).then(function(b){return b.getContext("2d").getImageData(0,0,q.width(a),q.height(a)).data})}function d(a,b){return h(a,b||{}).then(function(a){return a.toDataURL()})}function e(a,b){return b=b||{},h(a,b).then(function(a){return a.toDataURL("image/jpeg",b.quality||1)})}function f(a,b){return h(a,b||{}).then(q.canvasToBlob)}function g(a){"undefined"==typeof a.imagePlaceholder?v.impl.options.imagePlaceholder=u.imagePlaceholder:v.impl.options.imagePlaceholder=a.imagePlaceholder,"undefined"==typeof a.cacheBust?v.impl.options.cacheBust=u.cacheBust:v.impl.options.cacheBust=a.cacheBust}function h(a,c){function d(a){var b=document.createElement("canvas");if(b.width=c.width||q.width(a),b.height=c.height||q.height(a),c.bgcolor){var d=b.getContext("2d");d.fillStyle=c.bgcolor,d.fillRect(0,0,b.width,b.height)}return b}return b(a,c).then(q.makeImage).then(q.delay(100)).then(function(b){var c=d(a);return c.getContext("2d").drawImage(b,0,0),c})}function i(a,b,c){function d(a){return a instanceof HTMLCanvasElement?q.makeImage(a.toDataURL()):a.cloneNode(!1)}function e(a,b,c){function d(a,b,c){var d=Promise.resolve();return b.forEach(function(b){d=d.then(function(){return i(b,c)}).then(function(b){b&&a.appendChild(b)})}),d}var e=a.childNodes;return 0===e.length?Promise.resolve(b):d(b,q.asArray(e),c).then(function(){return b})}function f(a,b){function c(){function c(a,b){function c(a,b){q.asArray(a).forEach(function(c){b.setProperty(c,a.getPropertyValue(c),a.getPropertyPriority(c))})}a.cssText?b.cssText=a.cssText:c(a,b)}c(window.getComputedStyle(a),b.style)}function d(){function c(c){function d(a,b,c){function d(a){var b=a.getPropertyValue("content");return a.cssText+" content: "+b+";"}function e(a){function b(b){return b+": "+a.getPropertyValue(b)+(a.getPropertyPriority(b)?" !important":"")}return q.asArray(a).map(b).join("; ")+";"}var f="."+a+":"+b,g=c.cssText?d(c):e(c);return document.createTextNode(f+"{"+g+"}")}var e=window.getComputedStyle(a,c),f=e.getPropertyValue("content");if(""!==f&&"none"!==f){var g=q.uid();b.className=b.className+" "+g;var h=document.createElement("style");h.appendChild(d(g,c,e)),b.appendChild(h)}}[":before",":after"].forEach(function(a){c(a)})}function e(){a instanceof HTMLTextAreaElement&&(b.innerHTML=a.value),a instanceof HTMLInputElement&&b.setAttribute("value",a.value)}function f(){b instanceof SVGElement&&(b.setAttribute("xmlns","http://www.w3.org/2000/svg"),b instanceof SVGRectElement&&["width","height"].forEach(function(a){var c=b.getAttribute(a);c&&b.style.setProperty(a,c)}))}return b instanceof Element?Promise.resolve().then(c).then(d).then(e).then(f).then(function(){return b}):b}return c||!b||b(a)?Promise.resolve(a).then(d).then(function(c){return e(a,c,b)}).then(function(b){return f(a,b)}):Promise.resolve()}function j(a){return s.resolveAll().then(function(b){var c=document.createElement("style");return a.appendChild(c),c.appendChild(document.createTextNode(b)),a})}function k(a){return t.inlineAll(a).then(function(){return a})}function l(a,b,c){return Promise.resolve(a).then(function(a){return a.setAttribute("xmlns","http://www.w3.org/1999/xhtml"),(new XMLSerializer).serializeToString(a)}).then(q.escapeXhtml).then(function(a){return'<foreignObject x="0" y="0" width="100%" height="100%">'+a+"</foreignObject>"}).then(function(a){return'<svg xmlns="http://www.w3.org/2000/svg" width="'+b+'" height="'+c+'">'+a+"</svg>"}).then(function(a){return"data:image/svg+xml;charset=utf-8,"+a})}function m(){function a(){var a="application/font-woff",b="image/jpeg";return{woff:a,woff2:a,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:b,jpeg:b,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml"}}function b(a){var b=/\.([^\.\/]*?)$/g.exec(a);return b?b[1]:""}function c(c){var d=b(c).toLowerCase();return a()[d]||""}function d(a){return a.search(/^(data:)/)!==-1}function e(a){return new Promise(function(b){for(var c=window.atob(a.toDataURL().split(",")[1]),d=c.length,e=new Uint8Array(d),f=0;f<d;f++)e[f]=c.charCodeAt(f);b(new Blob([e],{type:"image/png"}))})}function f(a){return a.toBlob?new Promise(function(b){a.toBlob(b)}):e(a)}function g(a,b){var c=document.implementation.createHTMLDocument(),d=c.createElement("base");c.head.appendChild(d);var e=c.createElement("a");return c.body.appendChild(e),d.href=b,e.href=a,e.href}function h(){var a=0;return function(){function b(){return("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).slice(-4)}return"u"+b()+a++}}function i(a){return new Promise(function(b,c){var d=new Image;d.onload=function(){b(d)},d.onerror=c,d.src=a})}function j(a){var b=3e4;return v.impl.options.cacheBust&&(a+=(/\?/.test(a)?"&":"?")+(new Date).getTime()),new Promise(function(c){function d(){if(4===g.readyState){if(200!==g.status)return void(h?c(h):f("cannot fetch resource: "+a+", status: "+g.status));var b=new FileReader;b.onloadend=function(){var a=b.result.split(/,/)[1];c(a)},b.readAsDataURL(g.response)}}function e(){h?c(h):f("timeout of "+b+"ms occured while fetching resource: "+a)}function f(a){console.error(a),c("")}var g=new XMLHttpRequest;g.onreadystatechange=d,g.ontimeout=e,g.responseType="blob",g.timeout=b,g.open("GET",a,!0),g.send();var h;if(v.impl.options.imagePlaceholder){var i=v.impl.options.imagePlaceholder.split(/,/);i&&i[1]&&(h=i[1])}})}function k(a,b){return"data:"+b+";base64,"+a}function l(a){return a.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1")}function m(a){return function(b){return new Promise(function(c){setTimeout(function(){c(b)},a)})}}function n(a){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}function o(a){return a.replace(/#/g,"%23").replace(/\n/g,"%0A")}function p(a){var b=r(a,"border-left-width"),c=r(a,"border-right-width");return a.scrollWidth+b+c}function q(a){var b=r(a,"border-top-width"),c=r(a,"border-bottom-width");return a.scrollHeight+b+c}function r(a,b){var c=window.getComputedStyle(a).getPropertyValue(b);return parseFloat(c.replace("px",""))}return{escape:l,parseExtension:b,mimeType:c,dataAsUrl:k,isDataUrl:d,canvasToBlob:f,resolveUrl:g,getAndEncode:j,uid:h(),delay:m,asArray:n,escapeXhtml:o,makeImage:i,width:p,height:q}}function n(){function a(a){return a.search(e)!==-1}function b(a){for(var b,c=[];null!==(b=e.exec(a));)c.push(b[1]);return c.filter(function(a){return!q.isDataUrl(a)})}function c(a,b,c,d){function e(a){return new RegExp("(url\\(['\"]?)("+q.escape(a)+")(['\"]?\\))","g")}return Promise.resolve(b).then(function(a){return c?q.resolveUrl(a,c):a}).then(d||q.getAndEncode).then(function(a){return q.dataAsUrl(a,q.mimeType(b))}).then(function(c){return a.replace(e(b),"$1"+c+"$3")})}function d(d,e,f){function g(){return!a(d)}return g()?Promise.resolve(d):Promise.resolve(d).then(b).then(function(a){var b=Promise.resolve(d);return a.forEach(function(a){b=b.then(function(b){return c(b,a,e,f)})}),b})}var e=/url\(['"]?([^'"]+?)['"]?\)/g;return{inlineAll:d,shouldProcess:a,impl:{readUrls:b,inline:c}}}function o(){function a(){return b(document).then(function(a){return Promise.all(a.map(function(a){return a.resolve()}))}).then(function(a){return a.join("\n")})}function b(){function a(a){return a.filter(function(a){return a.type===CSSRule.FONT_FACE_RULE}).filter(function(a){return r.shouldProcess(a.style.getPropertyValue("src"))})}function b(a){var b=[];return a.forEach(function(a){try{q.asArray(a.cssRules||[]).forEach(b.push.bind(b))}catch(c){console.log("Error while reading CSS rules from "+a.href,c.toString())}}),b}function c(a){return{resolve:function(){var b=(a.parentStyleSheet||{}).href;return r.inlineAll(a.cssText,b)},src:function(){return a.style.getPropertyValue("src")}}}return Promise.resolve(q.asArray(document.styleSheets)).then(b).then(a).then(function(a){return a.map(c)})}return{resolveAll:a,impl:{readAll:b}}}function p(){function a(a){function b(b){return q.isDataUrl(a.src)?Promise.resolve():Promise.resolve(a.src).then(b||q.getAndEncode).then(function(b){return q.dataAsUrl(b,q.mimeType(a.src))}).then(function(b){return new Promise(function(c,d){a.onload=c,a.onerror=d,a.src=b})})}return{inline:b}}function b(c){function d(a){var b=a.style.getPropertyValue("background");return b?r.inlineAll(b).then(function(b){a.style.setProperty("background",b,a.style.getPropertyPriority("background"))}).then(function(){return a}):Promise.resolve(a)}return c instanceof Element?d(c).then(function(){return c instanceof HTMLImageElement?a(c).inline():Promise.all(q.asArray(c.childNodes).map(function(a){return b(a)}))}):Promise.resolve(c)}return{inlineAll:b,impl:{newImage:a}}}var q=m(),r=n(),s=o(),t=p(),u={imagePlaceholder:void 0,cacheBust:!1},v={toSvg:b,toPng:d,toJpeg:e,toBlob:f,toPixelData:c,impl:{fontFaces:s,images:t,util:q,inliner:r,options:{}}};"undefined"!=typeof module?module.exports=v:a.domtoimage=v}(this);
