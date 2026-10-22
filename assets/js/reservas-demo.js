(function () {
  "use strict";
  var app = document.getElementById("reservas-app");
  var model = window.RPAReservationsDemo;
  if (!app || !model) return;
  var store = model.createStore();
  var $ = function (id) { return document.getElementById(id); };
  var dateInput = $("demo-date"), shiftInput = $("demo-shift"), statusInput = $("demo-status"), searchInput = $("demo-search");
  var dialog = $("reservation-dialog"), form = $("reservation-form"), details = $("reservation-details");
  var activeView = "agenda", month = parseDate(store.today), returnFocus = null, selectedId = null;
  var statusNames = {pendente:"Pendente",confirmada:"Confirmada",cancelada:"Cancelada"};
  var shiftNames = {almoco:"Almoço",jantar:"Jantar",evento:"Evento"};
  function parseDate(value) { var p=value.split("-").map(Number);return new Date(p[0],p[1]-1,p[2],12); }
  function escape(value) { return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function shortDate(value) { return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit"}).format(parseDate(value)); }
  function fullDate(value) { return new Intl.DateTimeFormat("pt-BR",{day:"numeric",month:"long",year:"numeric"}).format(parseDate(value)); }
  function filters(withDate) { return {date:withDate ? dateInput.value : "",shift:shiftInput.value,status:statusInput.value,search:searchInput.value}; }
  function announce(text) { $("demo-announcement").textContent=text; }
  function renderCalendar() {
    var year=month.getFullYear(), index=month.getMonth(), first=new Date(year,index,1,12), last=new Date(year,index+1,0,12);
    var offset=(first.getDay()+6)%7, cells="", counts={};
    store.list(filters(false)).forEach(function(r){counts[r.date]=(counts[r.date]||0)+1;});
    $("demo-month").textContent=new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(first);
    $("demo-prev-month").disabled=year===2000&&index===0;
    $("demo-next-month").disabled=year===2100&&index===11;
    for(var blank=0;blank<offset;blank++) cells+='<span class="calendar-blank" aria-hidden="true"></span>';
    for(var day=1;day<=last.getDate();day++) {
      var key=model.dateKey(new Date(year,index,day,12)), count=counts[key]||0;
      cells+='<button type="button" class="calendar-day'+(key===store.today?' is-today':'')+'" data-demo-date="'+key+'" aria-pressed="'+(key===dateInput.value)+'" aria-label="'+escape(fullDate(key))+', '+count+' solicitações"'+(key===store.today?' aria-current="date"':'')+'><span>'+day+'</span><span class="calendar-count" aria-hidden="true">'+(count||'')+'</span></button>';
    }
    $("demo-calendar-days").innerHTML=cells;
  }
  function renderList(records) {
    var html=records.map(function(r){
      return '<li><button type="button" class="reservation-row" data-reservation-id="'+r.id+'" aria-label="Abrir '+r.id+', '+escape(r.name)+', '+shortDate(r.date)+' às '+r.time+', '+statusNames[r.status]+'"><span class="reservation-time"><strong>'+r.time+'</strong><span>'+shortDate(r.date)+'</span></span><span class="reservation-person"><strong>'+escape(r.name)+'</strong><span>'+r.id+' · '+shiftNames[r.shift]+'</span></span><span class="reservation-people">'+r.people+'<span>pessoas</span></span><span class="reservation-status status-'+r.status+'">'+statusNames[r.status]+'</span></button></li>';
    }).join("");
    $("demo-reservations").innerHTML=html;
    $("demo-empty").hidden=records.length>0;
    $("demo-result-count").textContent=records.length+(records.length===1?' solicitação':' solicitações');
    $("demo-list-title").textContent=dateInput.value?fullDate(dateInput.value):"Todas as datas";
    var summary=store.summary(records);
    $("demo-pending-count").textContent=summary.pendente;
    $("demo-confirmed-count").textContent=summary.confirmada;
    $("demo-canceled-count").textContent=summary.cancelada;
    $("demo-people-count").textContent=summary.people;
  }
  function render() {
    renderCalendar();renderList(store.list(filters(true)));
    $("demo-agenda").hidden=activeView!=="agenda";
    $("demo-workspace").classList.toggle("is-list-view",activeView==="pedidos");
    ["agenda","pedidos"].forEach(function(view){$("demo-view-"+view).setAttribute("aria-pressed",String(view===activeView));});
  }
  function openDialog() {
    returnFocus=document.activeElement;
    if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  }
  function closeDialog() {
    if(typeof dialog.close==="function")dialog.close();else {dialog.removeAttribute("open");restoreFocus();}
  }
  function restoreFocus(){ if(returnFocus&&returnFocus.isConnected)returnFocus.focus();else $("demo-new").focus(); }
  function fields() {return {name:$("reserve-name"),phone:$("reserve-phone"),date:$("reserve-date"),time:$("reserve-time"),people:$("reserve-people"),shift:$("reserve-shift"),status:$("reserve-status"),notes:$("reserve-notes")};}
  function openForm(record, alreadyOpen) {
    selectedId=record?record.id:null;
    $("reservation-title").textContent=record?"Editar solicitação "+record.id:"Nova solicitação";
    $("reservation-error").textContent="";form.reset();
    var defaults=record||{name:"",phone:"",date:dateInput.value||store.today,time:"19:00",people:2,shift:"jantar",status:"pendente",notes:""};
    var inputs=fields();Object.keys(inputs).forEach(function(key){inputs[key].value=defaults[key];});
    form.hidden=false;details.hidden=true;
    if(!alreadyOpen)openDialog();
    $("reserve-name").focus();
  }
  function renderDetails(record) {
    selectedId=record.id;form.hidden=true;details.hidden=false;
    $("reservation-title").textContent="Solicitação "+record.id;
    $("detail-name").textContent=record.name;
    $("detail-date").textContent=fullDate(record.date)+" às "+record.time;
    $("detail-shift").textContent=shiftNames[record.shift];
    $("detail-people").textContent=record.people+(record.people===1?" pessoa":" pessoas");
    $("detail-status").textContent=statusNames[record.status];
    $("detail-status").className="reservation-status status-"+record.status;
    $("detail-notes").textContent=record.notes||"Nenhuma observação.";
    $("detail-phone").textContent=record.phone?"+"+record.phone:"Não informado nesta demonstração";
    $("demo-confirm").disabled=record.status==="confirmada";
    $("demo-cancel").disabled=record.status==="cancelada";
    var contact=$("detail-whatsapp");contact.hidden=!record.phone;
    if(record.phone)contact.href="https://wa.me/"+record.phone+"?text="+encodeURIComponent("Olá! Sobre a solicitação "+record.id+" para "+shortDate(record.date)+" às "+record.time+".");
    else contact.removeAttribute("href");
    $("detail-contact-note").textContent=record.phone?"Abre uma conversa com o contato informado. Nenhuma mensagem é enviada automaticamente.":"Para testar o botão de WhatsApp, edite e informe apenas um número de teste sob seu controle.";
  }
  function changeStatus(status) {
    try {var record=store.updateStatus(selectedId,status);renderDetails(record);render();$("detail-feedback").textContent="Status alterado para "+statusNames[status].toLowerCase()+" nesta demonstração.";announce(record.id+" marcada como "+statusNames[status].toLowerCase()+". Nenhuma mensagem foi enviada.");}
    catch(error){$("detail-feedback").textContent=error.message;}
  }
  dateInput.value=store.today;
  dateInput.addEventListener("change",function(){if(!dateInput.value||model.validDate(dateInput.value)){if(dateInput.value)month=parseDate(dateInput.value);render();}});
  shiftInput.addEventListener("change",render);statusInput.addEventListener("change",render);searchInput.addEventListener("input",render);
  $("demo-all-dates").addEventListener("click",function(){dateInput.value="";activeView="pedidos";render();announce("Exibindo solicitações de todas as datas.");});
  $("demo-today").addEventListener("click",function(){dateInput.value=store.today;month=parseDate(store.today);render();});
  ["agenda","pedidos"].forEach(function(view){$("demo-view-"+view).addEventListener("click",function(){activeView=view;render();});});
  $("demo-prev-month").addEventListener("click",function(){if(this.disabled)return;month=new Date(month.getFullYear(),month.getMonth()-1,1,12);dateInput.value=model.dateKey(month);render();});
  $("demo-next-month").addEventListener("click",function(){if(this.disabled)return;month=new Date(month.getFullYear(),month.getMonth()+1,1,12);dateInput.value=model.dateKey(month);render();});
  app.addEventListener("click",function(event){
    var target=event.target.closest("[data-demo-date], [data-reservation-id]");if(!target)return;
    if(target.hasAttribute("data-demo-date")){dateInput.value=target.getAttribute("data-demo-date");render();var current=app.querySelector('[data-demo-date="'+dateInput.value+'"]');if(current)current.focus();}
    else {var record=store.get(target.getAttribute("data-reservation-id"));if(record){$("detail-feedback").textContent="";renderDetails(record);openDialog();$("reservation-close").focus();}}
  });
  $("demo-new").addEventListener("click",function(){openForm(null,false);});
  $("demo-reset").addEventListener("click",function(){store.reset();dateInput.value=store.today;month=parseDate(store.today);shiftInput.value="";statusInput.value="";searchInput.value="";activeView="agenda";render();announce("Demonstração reiniciada. Os dados fictícios originais foram restaurados.");});
  $("reservation-close").addEventListener("click",closeDialog);$("reservation-dismiss").addEventListener("click",closeDialog);
  dialog.addEventListener("close",restoreFocus);
  dialog.addEventListener("click",function(event){if(event.target===dialog){var b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeDialog();}});
  dialog.addEventListener("keydown",function(event){
    if(event.key==="Escape"&&typeof dialog.showModal!=="function"){event.preventDefault();closeDialog();}
    if(event.key!=="Tab")return;
    var nodes=Array.prototype.filter.call(dialog.querySelectorAll('button:not([disabled]),a[href],input,select,textarea'),function(el){return !el.closest("[hidden]");});
    if(!nodes.length)return;var first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  $("demo-edit").addEventListener("click",function(){openForm(store.get(selectedId),true);});
  $("demo-confirm").addEventListener("click",function(){changeStatus("confirmada");});
  $("demo-cancel").addEventListener("click",function(){changeStatus("cancelada");});
  form.addEventListener("submit",function(event){
    event.preventDefault();if(!form.reportValidity())return;
    try {var inputs=fields(),input={};Object.keys(inputs).forEach(function(key){input[key]=inputs[key].value;});var edited=!!selectedId,record=store.save(input,selectedId);dateInput.value=record.date;month=parseDate(record.date);shiftInput.value="";statusInput.value="";searchInput.value="";activeView="pedidos";render();closeDialog();announce(record.id+(edited?" atualizada":" criada")+" nesta demonstração. Nenhuma mensagem foi enviada.");}
    catch(error){$("reservation-error").textContent=error.message;$("reservation-error").focus();}
  });
  render();app.hidden=false;$("demo-loading").hidden=true;
}());
