export { ImageCarousel };

class ImageCarousel extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'open' });
	}
	connectedCallback() {
		this._root.appendChild(document.createElement('style')).textContent = `
:host(*){
	transform: scale(0);
	transition: all ease-out .4s;
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 4;
	background: antiquewhite;
	display: flex;
	align-items: center;
}
div {
	overflow: auto;
	min-width: 100%;
}
div text {
	position: fixed;
	left: 1em;
	top: 1em;
	color: white;
	background: transparent;
}
close {
	position: absolute;
	top: 0;
	right: 0;
	width: 1.5em;
	cursor: pointer;
	display: block;
	color: rgba(255, 255, 255, 0.6);
	font-size: 3em;
}`;
		var div = this._root.appendChild(document.createElement('div'));
		div.appendChild(document.createElement('img'));
		div.appendChild(document.createElement('text'));
		var close = this._root.appendChild(document.createElement('close'));
		close.onclick = () => this.close();
		close.innerText = 'x';
	}
	close() {
		this._root.host.style.transform = '';
	}
	open(list, i) {
		this._root.querySelector('img').src = list[i].src;
		this._root.querySelector('text').innerHTML = list[i].text;
		this._root.host.style.transform = 'scale(1)';
	}
}