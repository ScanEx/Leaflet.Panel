import './Panel.css';
import { translations as T } from 'lib/Translations/src/Translations.js';
import { EventTarget } from './lib/EventTarget/src/EventTarget.js';

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
                <i class="panel-icon-close" />
            </td>` : '';            
        this._container.innerHTML = 
            `<div class="panel-body">
                <table class="panel-header">
                        <tr>
                            <td class="panel-header-title">${title}</td>
                            <td class="panel-toggle-button" title="${T.getText('minimize')}">
                                <i class="panel-icon-minimize" />
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
   
        this._stopPropagation = this._stopPropagation.bind(this);
        this._startMove = this._startMove.bind(this);
        this._stopMove = this._stopMove.bind(this);
        this._handleMove = this._handleMove.bind(this);
        this._container.addEventListener('dragstart', this.preventDefault);
        this._header.addEventListener('mousedown', this._startMove);
        document.body.addEventListener('mouseup', this._stopMove);
        this._header.addEventListener('mousemove', this._handleMove);
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
    get header () {
        return this._header;
    }   
    get body () {
        return this._body;
    }
    get footer () {
        return this._footer;
    }
    get content () {
        return this._content;
    }
    _startMove (e) {        
        const {left, top} = this._container.getBoundingClientRect();
        this._offset = {x: e.clientX - left, y: e.clientY - top};
    }
    _stopMove (e) {
        this._offset = null;        
    }
    _handleMove (e) {
        if (this._offset) {
            this._container.style.left = `${e.clientX - this._offset.x}px`;
            this._container.style.top = `${e.clientY - this._offset.y}px`;
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
            const x = localStorage.getItem(`${this._id}.left`) || left;
            const y = localStorage.getItem(`${this._id}.top`) || top;
            this._container.style.left = `${x}px`;
            this._container.style.top = `${y}px`;            
        }
    }
    _savePosition () {
        if (typeof this._id === 'string' && this._id != '') {            
            const p = this._container.getBoundingClientRect();
            localStorage.setItem(`${this._id}.top`, p.top);
            localStorage.setItem(`${this._id}.left`, p.left);
        }
    }
}

export { Panel };