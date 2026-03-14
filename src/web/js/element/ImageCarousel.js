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
}
close {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 2;
	width: 5.5em;
	height: 3.5em;
	cursor: pointer;
	display: block;
}`;
		this._root.appendChild(document.createElement('div')).appendChild(document.createElement('img'));
		this._root.appendChild(document.createElement('close')).onclick = () => this.close();
	}
	close() {
		this._root.style.transform = '';
	}
	open(src) {
		this._root.querySelector('img').src = src;
		this._root.style.transform = 'scale(1)';
	}
}