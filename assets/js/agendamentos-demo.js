(function () {
  "use strict";
  var $=function(id){return document.getElementById(id);};
  var app=$("ag-app"),model=window.RPAAppointmentsDemo;
  if(!app||!model)return;
  var store;
  try {store=model.createStore();}
  catch(error){$("ag-fallback").textContent="A configuração da demonstração precisa ser revisada. Você pode conhecer a proposta pelo WhatsApp da RPAWorks.";return;}
  var config=store.config(),mode="client",chosenTime="",clientRecordId=null,editingId=null,returnFocus=null;
  var month=model.parseDate(store.exampleDate());
  var statusLabels={pendente:"Pendente",confirmado:"Confirmado",cancelado:"Cancelado"};
  var clientForm=$("ag-client-form"),dialog=$("ag-dialog"),editForm=$("ag-edit-form");
  function escape(value){return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function service(id){return config.services.find(function(s){return s.id===id;});}
  function professional(id){return config.professionals.find(function(p){return p.id===id;});}
  function dateLabel(value,short){var d=model.parseDate(value);return d?new Intl.DateTimeFormat("pt-BR",short?{day:"2-digit",month:"2-digit"}:{day:"numeric",month:"long",year:"numeric"}).format(d):"Escolha a data";}
  function endTime(record){return model.timeKey(model.minutes(record.time)+service(record.serviceId).duration);}
  function announce(text){$("ag-announcement").textContent=text;}
  function servicesOptions(){return config.services.map(function(s){return '<option value="'+escape(s.id)+'">'+escape(s.name)+' · '+s.duration+' min</option>';}).join("");}
  function fillProfessionals(select,serviceId,preferred){
    var options=config.professionals.filter(function(p){return p.services.indexOf(serviceId)!==-1;});
    select.innerHTML=options.map(function(p){return '<option value="'+escape(p.id)+'">'+escape(p.name)+(p.specialty?' · '+escape(p.specialty):'')+'</option>';}).join("");
    select.value=options.some(function(p){return p.id===preferred;})?preferred:(options[0]?options[0].id:"");
  }
  function updateClientSummary(){
    var saved=clientRecordId?store.get(clientRecordId):null;
    var s=service(saved?saved.serviceId:$("ag-service").value),p=professional(saved?saved.professionalId:$("ag-professional").value),date=saved?saved.date:$("ag-date").value,time=saved?saved.time:chosenTime;
    $("ag-summary-service").textContent=s?s.name:"Escolha o serviço";
    $("ag-summary-professional").textContent=p?p.name:"Escolha o profissional";
    $("ag-summary-date").textContent=dateLabel(date,false);
    $("ag-summary-time").textContent=time?time+" às "+model.timeKey(model.minutes(time)+s.duration):"Escolha o horário";
    $("ag-summary-duration").textContent=s?s.duration+" minutos":"—";
    $("ag-before-submit").textContent=chosenTime&&s&&p?s.name+" · "+p.name+" · "+dateLabel(date,true)+" · "+chosenTime+" às "+model.timeKey(model.minutes(chosenTime)+s.duration):"Escolha o serviço, o profissional e um horário para continuar.";
  }
  function updateClientSlots(){
    var serviceId=$("ag-service").value,professionalId=$("ag-professional").value,date=$("ag-date").value;
    $("ag-date").min=store.today();$("ag-date").max=store.lastDate();
    var slots=store.slots(serviceId,professionalId,date),available=slots.filter(function(s){return s.available;});
    if(!available.some(function(s){return s.time===chosenTime;}))chosenTime="";
    $("ag-times").innerHTML=slots.map(function(s){
      return '<button type="button" class="ag-time" data-ag-time="'+s.time+'" aria-pressed="'+(s.time===chosenTime)+'" aria-label="'+s.time+' até '+s.endTime+', '+(s.available?'disponível':escape(s.reason))+'"'+(s.available?'':' disabled')+'><span>'+s.time+'</span>'+(s.available?'':'<small>'+(s.reason==='Horário ocupado'?'Ocupado':'Indisponível')+'</small>')+'</button>';
    }).join("");
    var note;
    if(!model.parseDate(date))note="Escolha uma data para consultar os horários.";
    else if(date<store.today())note="Datas passadas não estão disponíveis para novos agendamentos.";
    else if(!slots.length)note="Sem expediente para este profissional e serviço nesta data. Escolha outro dia.";
    else if(!available.length)note="Não há horários livres neste dia para o serviço e o profissional escolhidos.";
    else note=available.length+" horários disponíveis. O serviço ocupa "+service(serviceId).duration+" minutos.";
    $("ag-slot-note").textContent=note;
    $("ag-next-date").hidden=available.length>0;
    updateClientSummary();
  }
  function renderClientResult(){
    var record=clientRecordId?store.get(clientRecordId):null;
    clientForm.hidden=!!record;$("ag-client-success").hidden=!record;
    if(!record)return;
    $("ag-success-id").textContent=record.id+" · "+statusLabels[record.status];
    $("ag-success-service").textContent=service(record.serviceId).name;
    $("ag-success-professional").textContent=professional(record.professionalId).name;
    $("ag-success-date").textContent=dateLabel(record.date,false)+" · "+record.time+" às "+endTime(record);
    $("ag-success-client").textContent=record.client;
  }
  function setMode(next,focusTab){
    mode=next;
    ["client","admin"].forEach(function(value){
      var active=value===mode,tab=$("ag-tab-"+value);
      tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;
      $("ag-"+value+"-view").hidden=!active;
    });
    if(next==="client"){updateClientSlots();renderClientResult();}else renderAdmin();
    if(focusTab)$("ag-tab-"+next).focus();
  }
  function adminFilters(includeDate){return {date:includeDate?$("ag-admin-date").value:"",professionalId:$("ag-admin-professional").value,status:$("ag-admin-status").value};}
  function renderCalendar(){
    var year=month.getFullYear(),index=month.getMonth(),first=new Date(year,index,1,12),last=new Date(year,index+1,0,12),counts={},html="";
    $("ag-month").textContent=new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(first);
    $("ag-month-prev").disabled=year===2000&&index===0;$("ag-month-next").disabled=year===2100&&index===11;
    store.list(adminFilters(false)).forEach(function(r){counts[r.date]=(counts[r.date]||0)+1;});
    for(var blank=0;blank<(first.getDay()+6)%7;blank++)html+='<span aria-hidden="true"></span>';
    for(var day=1;day<=last.getDate();day++){
      var key=model.dateKey(new Date(year,index,day,12)),count=counts[key]||0;
      html+='<button type="button" class="ag-day" data-ag-day="'+key+'" aria-pressed="'+(key===$("ag-admin-date").value)+'"'+(key===store.today()?' aria-current="date"':'')+' aria-label="'+escape(dateLabel(key,false))+', '+count+' agendamentos"><span>'+day+'</span><small aria-hidden="true">'+(count||'')+'</small></button>';
    }
    $("ag-calendar-days").innerHTML=html;
  }
  function renderAdmin(){
    renderCalendar();var records=store.list(adminFilters(true));
    $("ag-list-date").textContent=dateLabel($("ag-admin-date").value,false);
    $("ag-list-count").textContent=records.length+(records.length===1?" agendamento":" agendamentos")+" neste recorte";
    $("ag-admin-empty").hidden=records.length>0;
    $("ag-appointments").innerHTML=records.map(function(r){return '<li><button type="button" class="ag-appointment" data-ag-record="'+r.id+'" aria-label="Abrir agendamento '+r.id+', '+r.time+', '+statusLabels[r.status]+'"><span class="ag-appointment-time"><strong>'+r.time+'</strong><span>'+endTime(r)+'</span></span><span class="ag-appointment-info"><strong>'+escape(service(r.serviceId).name)+'</strong><span>'+escape(r.client)+'</span><small>'+escape(professional(r.professionalId).name)+' · '+r.id+'</small></span><span class="ag-status ag-status--'+r.status+'">'+statusLabels[r.status]+'</span></button></li>';}).join("");
  }
  function openDialog(){
    if(dialog.open)return;
    returnFocus=document.activeElement;
    if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  }
  function restoreFocus(){if(returnFocus&&returnFocus.isConnected)returnFocus.focus();else $("ag-admin-new").focus();}
  function closeDialog(){if(typeof dialog.close==="function")dialog.close();else {dialog.removeAttribute("open");restoreFocus();}}
  function renderDetails(record){
    editingId=record.id;$("ag-dialog-details").hidden=false;editForm.hidden=true;
    $("ag-dialog-title").textContent="Agendamento "+record.id;
    $("ag-detail-client").textContent=record.client;
    $("ag-detail-service").textContent=service(record.serviceId).name;
    $("ag-detail-professional").textContent=professional(record.professionalId).name;
    $("ag-detail-date").textContent=dateLabel(record.date,false);
    $("ag-detail-time").textContent=record.time+" às "+endTime(record)+" · "+service(record.serviceId).duration+" min";
    $("ag-detail-status").textContent=statusLabels[record.status];$("ag-detail-status").className="ag-status ag-status--"+record.status;
    $("ag-confirm-record").disabled=record.status==="confirmado";$("ag-cancel-record").disabled=record.status==="cancelado";
  }
  function updateEditSlots(preferred){
    var original=editingId?store.get(editingId):null,sId=$("ag-edit-service").value,pId=$("ag-edit-professional").value,date=$("ag-edit-date").value;
    var keepOriginal=original&&sId===original.serviceId&&pId===original.professionalId&&date===original.date&&($("ag-edit-status").value==="cancelado"||original.status!=="cancelado");
    var slots=store.slots(sId,pId,date,editingId),availableCount=0;
    $("ag-edit-time").innerHTML='<option value="">Escolha um horário</option>'+slots.map(function(slot){
      var allowed=slot.available||(keepOriginal&&slot.time===original.time);if(allowed)availableCount++;
      return '<option value="'+slot.time+'"'+(allowed?'':' disabled')+'>'+slot.time+' às '+slot.endTime+(allowed?'':' · '+escape(slot.reason))+'</option>';
    }).join("");
    var valid=slots.some(function(slot){return slot.time===preferred&&(slot.available||(keepOriginal&&slot.time===original.time));});
    $("ag-edit-time").value=valid?preferred:"";
    $("ag-edit-slot-note").textContent=availableCount?"A disponibilidade considera a duração do serviço e os demais pedidos deste profissional.":"Sem horários livres para esta seleção. Altere a data ou o profissional.";
  }
  function openEdit(record){
    editingId=record?record.id:null;
    $("ag-dialog-title").textContent=record?"Editar / remarcar "+record.id:"Novo agendamento de teste";
    $("ag-dialog-details").hidden=true;editForm.hidden=false;$("ag-edit-error").textContent="";editForm.reset();
    var preferredProfessional=professional($("ag-admin-professional").value)||config.professionals[0];
    var sId=record?record.serviceId:preferredProfessional.services[0],pId=record?record.professionalId:preferredProfessional.id;
    var date=record?record.date:store.firstDate(sId,pId,$("ag-admin-date").value);
    $("ag-edit-name").value=record?record.client:"";$("ag-edit-service").value=sId;
    fillProfessionals($("ag-edit-professional"),sId,pId);
    $("ag-edit-date").min=record&&record.date<store.today()?record.date:store.today();$("ag-edit-date").max=store.lastDate();$("ag-edit-date").value=date;
    $("ag-edit-cancelled").disabled=!record;$("ag-edit-cancelled").hidden=!record;$("ag-edit-status").value=record?record.status:"pendente";
    updateEditSlots(record?record.time:"");openDialog();$("ag-edit-name").focus();
  }
  function updateStatus(next){
    try {var record=store.updateStatus(editingId,next);renderDetails(record);renderAdmin();updateClientSlots();renderClientResult();$("ag-detail-feedback").textContent="Status alterado para "+statusLabels[next].toLowerCase()+". Simulação local; nenhuma mensagem foi enviada.";announce(record.id+" atualizado para "+statusLabels[next].toLowerCase()+" nesta demonstração.");}
    catch(error){$("ag-detail-feedback").textContent=error.message;}
  }
  function initialize(){
    editingId=null;editForm.reset();$("ag-edit-name").value="";$("ag-edit-error").textContent="";
    $("ag-service").innerHTML=servicesOptions();$("ag-edit-service").innerHTML=servicesOptions();
    $("ag-service").value=config.services[0].id;fillProfessionals($("ag-professional"),$("ag-service").value,"");
    $("ag-date").value=store.exampleDate();$("ag-client-name").value="";chosenTime="";clientRecordId=null;
    $("ag-admin-date").value=store.exampleDate();$("ag-admin-professional").innerHTML='<option value="">Todos os profissionais</option>'+config.professionals.map(function(p){return '<option value="'+escape(p.id)+'">'+escape(p.name)+'</option>';}).join("");
    $("ag-admin-status").value="";month=model.parseDate(store.exampleDate());
    $("ag-demo-config").textContent=config.services.length+" serviços · "+config.professionals.length+" profissionais fictícios";
    $("ag-catalog").innerHTML=config.services.map(function(s){var pros=config.professionals.filter(function(p){return p.services.indexOf(s.id)!==-1;}).map(function(p){return p.name;}).join(", ");return '<li><div><strong>'+escape(s.name)+'</strong><span>'+escape(pros)+'</span></div><span>'+s.duration+' min</span></li>';}).join("");
    $("ag-client-error").textContent="";setMode("client",false);
  }
  ["client","admin"].forEach(function(value){
    $("ag-tab-"+value).addEventListener("click",function(){setMode(value,false);});
    $("ag-tab-"+value).addEventListener("keydown",function(event){if(["ArrowLeft","ArrowRight","Home","End"].indexOf(event.key)===-1)return;event.preventDefault();setMode(event.key==="Home"?"client":event.key==="End"?"admin":value==="client"?"admin":"client",true);});
  });
  $("ag-service").addEventListener("change",function(){fillProfessionals($("ag-professional"),this.value,$("ag-professional").value);chosenTime="";$("ag-client-error").textContent="";updateClientSlots();});
  $("ag-professional").addEventListener("change",function(){chosenTime="";$("ag-client-error").textContent="";updateClientSlots();});
  $("ag-date").addEventListener("change",function(){chosenTime="";$("ag-client-error").textContent="";updateClientSlots();});
  $("ag-next-date").addEventListener("click",function(){var date=store.firstDate($("ag-service").value,$("ag-professional").value,$("ag-date").value);if(date){$("ag-date").value=date;chosenTime="";updateClientSlots();$("ag-slot-note").focus();}else {$("ag-client-error").textContent="Não há datas disponíveis na configuração atual da demonstração.";$("ag-client-error").focus();}});
  app.addEventListener("click",function(event){
    var target=event.target.closest("[data-ag-time],[data-ag-day],[data-ag-record]");if(!target||target.disabled)return;
    if(target.hasAttribute("data-ag-time")){
      var time=target.getAttribute("data-ag-time"),available=store.slots($("ag-service").value,$("ag-professional").value,$("ag-date").value).some(function(s){return s.time===time&&s.available;});
      if(!available){updateClientSlots();$("ag-client-error").textContent="Este horário ficou indisponível. Escolha outro.";return;}
      chosenTime=time;$("ag-client-error").textContent="";updateClientSlots();var current=app.querySelector('[data-ag-time="'+time+'"]');if(current)current.focus();
    }else if(target.hasAttribute("data-ag-day")){
      $("ag-admin-date").value=target.getAttribute("data-ag-day");renderAdmin();var dayButton=app.querySelector('[data-ag-day="'+$("ag-admin-date").value+'"]');if(dayButton)dayButton.focus();
    }else {var record=store.get(target.getAttribute("data-ag-record"));if(record){$("ag-detail-feedback").textContent="";renderDetails(record);openDialog();$("ag-dialog-close").focus();}}
  });
  clientForm.addEventListener("submit",function(event){
    event.preventDefault();$("ag-client-error").textContent="";
    if(!chosenTime){$("ag-client-error").textContent="Escolha um horário disponível antes de continuar.";$("ag-client-error").focus();return;}
    if(!clientForm.reportValidity())return;
    try {var r=store.save({client:$("ag-client-name").value,serviceId:$("ag-service").value,professionalId:$("ag-professional").value,date:$("ag-date").value,time:chosenTime,status:"pendente"});clientRecordId=r.id;chosenTime="";updateClientSlots();renderClientResult();$("ag-success-title").focus();}
    catch(error){updateClientSlots();$("ag-client-error").textContent=error.message;$("ag-client-error").focus();}
  });
  $("ag-book-another").addEventListener("click",function(){clientRecordId=null;chosenTime="";$("ag-client-name").value="";renderClientResult();updateClientSlots();$("ag-service").focus();});
  $("ag-view-created").addEventListener("click",function(){var r=store.get(clientRecordId);if(!r)return;$("ag-admin-date").value=r.date;$("ag-admin-professional").value=r.professionalId;$("ag-admin-status").value="";month=model.parseDate(r.date);setMode("admin",true);});
  $("ag-admin-date").addEventListener("change",function(){if(model.parseDate(this.value)){month=model.parseDate(this.value);renderAdmin();}});
  $("ag-admin-professional").addEventListener("change",renderAdmin);$("ag-admin-status").addEventListener("change",renderAdmin);
  $("ag-admin-today").addEventListener("click",function(){$("ag-admin-date").value=store.today();month=model.parseDate(store.today());renderAdmin();});
  $("ag-month-prev").addEventListener("click",function(){if(this.disabled)return;month=new Date(month.getFullYear(),month.getMonth()-1,1,12);$("ag-admin-date").value=model.dateKey(month);renderAdmin();});
  $("ag-month-next").addEventListener("click",function(){if(this.disabled)return;month=new Date(month.getFullYear(),month.getMonth()+1,1,12);$("ag-admin-date").value=model.dateKey(month);renderAdmin();});
  $("ag-admin-new").addEventListener("click",function(){openEdit(null);});$("ag-edit-button").addEventListener("click",function(){openEdit(store.get(editingId));});
  $("ag-confirm-record").addEventListener("click",function(){updateStatus("confirmado");});$("ag-cancel-record").addEventListener("click",function(){updateStatus("cancelado");});
  $("ag-edit-service").addEventListener("change",function(){fillProfessionals($("ag-edit-professional"),this.value,$("ag-edit-professional").value);updateEditSlots($("ag-edit-time").value);});
  ["ag-edit-professional","ag-edit-date","ag-edit-status"].forEach(function(id){$(id).addEventListener("change",function(){updateEditSlots($("ag-edit-time").value);});});
  editForm.addEventListener("submit",function(event){
    event.preventDefault();if(!editForm.reportValidity())return;
    try {var r=store.save({client:$("ag-edit-name").value,serviceId:$("ag-edit-service").value,professionalId:$("ag-edit-professional").value,date:$("ag-edit-date").value,time:$("ag-edit-time").value,status:$("ag-edit-status").value},editingId);$("ag-admin-date").value=r.date;$("ag-admin-professional").value=r.professionalId;$("ag-admin-status").value="";month=model.parseDate(r.date);renderAdmin();updateClientSlots();renderClientResult();closeDialog();announce(r.id+" salvo na demonstração. Nenhum agendamento real foi realizado.");}
    catch(error){$("ag-edit-error").textContent=error.message;updateEditSlots($("ag-edit-time").value);$("ag-edit-error").focus();}
  });
  $("ag-dialog-close").addEventListener("click",closeDialog);$("ag-edit-dismiss").addEventListener("click",closeDialog);dialog.addEventListener("close",restoreFocus);
  dialog.addEventListener("click",function(event){if(event.target!==dialog)return;var b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeDialog();});
  dialog.addEventListener("keydown",function(event){
    if(event.key==="Escape"&&typeof dialog.showModal!=="function"){event.preventDefault();closeDialog();}
    if(event.key!=="Tab")return;
    var nodes=Array.prototype.filter.call(dialog.querySelectorAll('button:not([disabled]),input,select'),function(el){return !el.disabled&&!el.closest("[hidden]");});
    if(!nodes.length)return;var first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  $("ag-reset").addEventListener("click",function(){store.reset();initialize();announce("Demonstração reiniciada. Os agendamentos fictícios originais foram restaurados.");});
  initialize();app.hidden=false;$("ag-fallback").hidden=true;
}());
