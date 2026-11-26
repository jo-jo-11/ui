/** 校園徵才彈窗：原生 dialog 負責背景隔離、焦點限制及 Escape 關閉。
 * 場次與文案放在 index.html；外觀與 Hover 放在 home.css「校園徵才彈窗」。 */
(function(){
'use strict';
const dialog=document.getElementById('campus-dialog'),open=document.querySelector('.campus-open');
if(!dialog||!open)return;
const tabs=Array.from(dialog.querySelectorAll('[role="tab"]'));
function select(tab){tabs.forEach(item=>{const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;});}
open.addEventListener('click',()=>{dialog.showModal();document.body.classList.add('campus-is-open');dialog.querySelector('.campus-close').focus();});
dialog.querySelector('.campus-close').addEventListener('click',()=>dialog.close());
// 僅點擊面板外的遮罩時關閉；內容點擊與拖曳選取不會誤關閉。
let backdropDown=false;
function outside(event){const r=dialog.getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;}
dialog.addEventListener('pointerdown',event=>{backdropDown=event.target===dialog&&outside(event);});
dialog.addEventListener('click',event=>{if(backdropDown&&event.target===dialog&&outside(event))dialog.close();backdropDown=false;});
dialog.addEventListener('close',()=>{document.body.classList.remove('campus-is-open');open.focus({preventScroll:true});});
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(tabs[next]);tabs[next].focus();});});
}());
