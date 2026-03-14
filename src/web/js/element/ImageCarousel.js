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
	flex-direction: column;
	align-items: center;
}
div {
	overflow: auto;
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
		this._root.appendChild(document.createElement('div')).appendChild(document.createElement('img'));
		var close = this._root.appendChild(document.createElement('close'));
		close.onclick = () => this.close();
		close.innerText = 'x';
	}
	close() {
		this._root.host.style.transform = '';
	}
	open(src) {
		this._root.querySelector('img').src = src;
		this._root.host.style.transform = 'scale(1)';
	}
}