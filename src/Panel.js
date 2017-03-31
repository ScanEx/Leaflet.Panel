import './Panel.css';
import { Translations } from './lib/Translations/src/Translations.js';
import { EventTarget } from './lib/EventTarget/src/EventTarget.js';

window.Catalog = window.Catalog || {};
window.Catalog.Translations = window.Catalog.Translations || new Translations();

const T = window.Catalog.Translations;

T.addText ('rus', {
    minimize: 'Свернуть',
    maximize: 'Показать',
    close: 'Закрыть',
});
T.addText ('eng', {
    minimize: 'Minimize',
    maximize: 'Maximize',
    close: 'Close',
});

class Panel extends EventTarget {
    constructor(container, {        
        title = '', id = '', closable = true, left = 100, top = 100, modal = false}) {
        super();
        this._id = id;
        this._container = container;
        this._modal = modal;
        this._container.classList.add ('noselect');        
        this._container.classList.add ('panel-container');        
        const useClose = closable ? 
            `<td class="panel-close-button" title="${T.getText('close')}">
                <i class="fa fa-times-circle" />
            </td>` : '';            
        this._container.innerHTML = 
            `<div class="panel-body">
                <table class="panel-header">
                        <tr>
                            <td class="panel-header-title">${title}</td>
                            <td class="panel-toggle-button" title="${T.getText('minimize')}">
                                <i class="fa fa-minus-circle" />
                            </td>
                            ${useClose}
                        </tr>
                </table>
                <div class="panel-content"></div>
                <div class="panel-footer"></div>
            </div>`;
        this._body = this._container.querySelector('.panel-body');
        this._header = this._container.querySelector('.panel-header');
        this._title = this._container.querySelector('.panel-header-title');
        this._content = this._container.querySelector('.panel-content');
        this._footer = this._container.querySelector('.panel-footer');
        this.toggle = this.toggle.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this._toggleButton = this._container.querySelector('.panel-toggle-button');
        this._toggleButton.addEventListener('click', this.toggle);

        if (closable) {
            this._closeButton = this._container.querySelector('.panel-close-button');
            this._closeButton.addEventListener('click', this.hide);
        }        
        this._savePosition = this._savePosition.bind(this);
        this._draggable = new L.Draggable (this._container);
        this._draggable.addEventListener('dragend', this._savePosition);
        this._draggable.enable();        

        this._stopPropagation = this._stopPropagation.bind(this);

        this._container.addEventListener('mousewheel', this._stopPropagation);
        this._restorePosition(top, left);
        if(this._modal) {
            this._ovl = document.querySelector('.panel-modal-overlay');
            if(!this._ovl) {
                this._ovl = document.createElement('div');
                document.body.appendChild(this._ovl);
                this._ovl.className = 'panel-modal-overlay';
                this._ovl.style.display = 'none';
                this._ovl.addEventListener('mousemove', this._stopPropagation);
                this._ovl.addEventListener('mousewheel', this._stopPropagation);
                this._ovl.addEventListener('click', this._stopPropagation);
            }
            this._container.classList.add('panel-modal');
        }
        else {
            this._container.classList.add('panel-non-modal');
        }
    }
    _stopPropagation (e) {
        e.stopPropagation();
    }
    show() {
        if(this._modal) {
            this._ovl.style.display = 'block';
        }
        this._body.style.visibility = 'visible';
        this.dispatchEvent(new Event('show'));        
    }
    hide() {
        if(this._modal) {
            this._ovl.style.display = 'none';
        }
        this._body.style.visibility = 'hidden';
        this.dispatchEvent(new Event('hide'));
    }
    toggle() {     
        let btn = this._toggleButton.querySelector('i');
        if (this._content.style.display == 'none'){            
            btn.classList.remove('fa-plus-circle');
            btn.classList.add('fa-minus-circle');
            this._content.style.display = 'block';
        }
        else {
            btn.classList.remove('fa-minus-circle');
            btn.classList.add('fa-plus-circle');
            this._content.style.display = 'none';            
        }
    }
    getTitle () {
        return this._title.innerText;
    }
    setTitle (text) {        
        return this._title.innerText = text;
    }    
    _restorePosition(top, left) {
        if (typeof this._id === 'string' && this._id != '') {            
            L.DomUtil.setPosition(this._container,
                L.point(localStorage.getItem(`${this._id}.left`) || left, localStorage.getItem(`${this._id}.top`) || top)
            );            
        }
    }
    _savePosition () {
        if (typeof this._id === 'string' && this._id != '') {            
            const p = L.DomUtil.getPosition(this._container);
            localStorage.setItem(`${this._id}.top`, p.y);
            localStorage.setItem(`${this._id}.left`, p.x);
        }
    }
}

export { Panel };