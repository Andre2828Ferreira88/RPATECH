/* Protótipo local: regras de agenda, dados fictícios e nenhuma persistência ou rede. */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RPAAppointmentsDemo = factory();
}(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  var DEFAULT_CONFIG = {
    slotStep: 15,
    bookingDays: 90,
    services: [
      {id:"corte", name:"Corte e finalização", duration:60},
      {id:"manicure", name:"Manicure", duration:45},
      {id:"sobrancelhas", name:"Design de sobrancelhas", duration:30},
      {id:"pele", name:"Limpeza de pele", duration:60}
    ],
    professionals: [
      {id:"prof-a", name:"Profissional A", specialty:"Cabelo e sobrancelhas", services:["corte","sobrancelhas"], days:[1,2,3,4,5,6]},
      {id:"prof-b", name:"Profissional B", specialty:"Unhas e sobrancelhas", services:["manicure","sobrancelhas"], days:[1,2,3,4,5,6]},
      {id:"prof-c", name:"Profissional C", specialty:"Estética e sobrancelhas", services:["pele","sobrancelhas"], days:[2,3,4,5,6]}
    ],
    // 0 = domingo; 6 = sábado. Cada período precisa comportar o serviço inteiro.
    hours: {
      0:[],
      1:[["09:00","12:00"],["13:00","18:00"]],
      2:[["09:00","12:00"],["13:00","18:00"]],
      3:[["09:00","12:00"],["13:00","18:00"]],
      4:[["09:00","12:00"],["13:00","18:00"]],
      5:[["09:00","12:00"],["13:00","18:00"]],
      6:[["09:00","13:00"]]
    }
  };
  var statuses = ["pendente","confirmado","cancelado"];
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function fail(code, text) { var error=new Error(text);error.code=code;throw error; }
  function dateKey(date) { return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0"); }
  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value||"")) return null;
    var p=value.split("-").map(Number), date=new Date(p[0],p[1]-1,p[2],12);
    return p[0]>=2000&&p[0]<=2100&&dateKey(date)===value?date:null;
  }
  function addDays(value, count) { var d=parseDate(value);if(!d)return "";d.setDate(d.getDate()+count);return dateKey(d); }
  function minutes(time) { if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time||""))return -1;var p=time.split(":").map(Number);return p[0]*60+p[1]; }
  function timeKey(value) { return String(Math.floor(value/60)).padStart(2,"0")+":"+String(value%60).padStart(2,"0"); }
  function validateConfig(config) {
    if(!Number.isInteger(config.slotStep)||config.slotStep<5||config.slotStep>60||!Number.isInteger(config.bookingDays)||config.bookingDays<1||config.bookingDays>365)fail("CONFIG","Confira o intervalo da grade e o período de agendamento no modelo.");
    if(!Array.isArray(config.services)||!config.services.length||!Array.isArray(config.professionals)||!config.professionals.length)fail("CONFIG","Cadastre serviços e profissionais na configuração.");
    var ids=[];
    config.services.forEach(function(s){
      if(!/^[a-z][a-z0-9-]{0,39}$/.test(s.id)||typeof s.name!=="string"||!s.name.trim()||s.name.length>80||!Number.isInteger(s.duration)||s.duration<config.slotStep||s.duration>480||s.duration%config.slotStep||ids.indexOf(s.id)!==-1)fail("CONFIG","Confira os serviços, identificadores e durações da configuração.");
      ids.push(s.id);
    });
    var professionals=[];
    config.professionals.forEach(function(p){
      if(!/^[a-z][a-z0-9-]{0,39}$/.test(p.id)||typeof p.name!=="string"||!p.name.trim()||p.name.length>80||professionals.indexOf(p.id)!==-1||!Array.isArray(p.services)||!p.services.length||p.services.some(function(id){return ids.indexOf(id)===-1;})||!Array.isArray(p.days)||!p.days.length||p.days.some(function(day){return !Number.isInteger(day)||day<0||day>6;}))fail("CONFIG","Confira os profissionais, serviços habilitados e dias de atendimento.");
      professionals.push(p.id);
    });
    if(!config.hours||typeof config.hours!=="object")fail("CONFIG","Configure os períodos de expediente.");
    for(var day=0;day<7;day++){
      var periods=config.hours[day];if(!Array.isArray(periods))fail("CONFIG","Informe os períodos de cada dia da semana.");
      var previous=-1;
      periods.forEach(function(period){
        if(!Array.isArray(period)||period.length!==2)fail("CONFIG","Cada período deve ter início e fim.");
        var start=minutes(period[0]),end=minutes(period[1]);
        if(start<0||end<=start||start<previous)fail("CONFIG","Os períodos de expediente precisam ser válidos, ordenados e sem sobreposição.");
        previous=end;
      });
    }
  }

  function createStore(options) {
    options=options||{};
    var clock=typeof options.clock==="function"?options.clock:function(){return new Date();};
    var config=clone(options.config||DEFAULT_CONFIG);validateConfig(config);
    var records=[],nextId=1,exampleDate="";
    function now() { var value=clock();if(!(value instanceof Date)||!Number.isFinite(value.getTime()))fail("CLOCK","A data do navegador não está disponível.");return new Date(value.getTime()); }
    function today() { return dateKey(now()); }
    function lastDate() { return addDays(today(),config.bookingDays); }
    function service(id) { return config.services.find(function(s){return s.id===id;}); }
    function professional(id) { return config.professionals.find(function(p){return p.id===id;}); }
    function compatible(serviceId, professionalId) { var p=professional(professionalId);return !!service(serviceId)&&!!p&&p.services.indexOf(serviceId)!==-1; }
    function get(id) { var r=records.find(function(item){return item.id===id;});return r?clone(r):null; }
    function slots(serviceId, professionalId, date, excludeId) {
      var s=service(serviceId),p=professional(professionalId),day=parseDate(date);
      if(!s||!p||!day||!compatible(serviceId,professionalId))return [];
      if(p.days.indexOf(day.getDay())===-1)return [];
      var instant=now(),currentDate=dateKey(instant),cutoff=instant.getHours()*60+instant.getMinutes()+instant.getSeconds()/60+instant.getMilliseconds()/60000;
      var result=[];
      config.hours[day.getDay()].forEach(function(period){
        var start=minutes(period[0]),end=minutes(period[1]);
        for(var at=start;at+s.duration<=end;at+=config.slotStep){
          var reason="";
          if(date<currentDate||(date===currentDate&&at<=cutoff))reason="Horário passado";
          else if(date>addDays(currentDate,config.bookingDays))reason="Fora do período demonstrativo";
          else if(records.some(function(r){return r.id!==excludeId&&r.status!=="cancelado"&&r.professionalId===professionalId&&r.date===date&&at<minutes(r.time)+service(r.serviceId).duration&&at+s.duration>minutes(r.time);}))reason="Horário ocupado";
          result.push({time:timeKey(at),endTime:timeKey(at+s.duration),available:!reason,reason:reason});
        }
      });
      return result;
    }
    function firstDate(serviceId,professionalId,from) {
      var start=from&&parseDate(from)&&from>=today()?from:today(),last=lastDate();
      for(var d=start;d&&d<=last;d=addDays(d,1))if(slots(serviceId,professionalId,d).some(function(s){return s.available;}))return d;
      return "";
    }
    function isSameSchedule(a,b) { return a&&a.date===b.date&&a.time===b.time&&a.serviceId===b.serviceId&&a.professionalId===b.professionalId; }
    function save(input,id) {
      input=input||{};
      var previous=id?get(id):null;
      if(id&&!previous)fail("NOT_FOUND","Agendamento não encontrado. Reinicie a demonstração.");
      var client=String(input.client||"").trim();
      if(client.length<2||client.length>60||/[\x00-\x1f\x7f]/.test(client))fail("CLIENT","Use um nome fictício com 2 a 60 caracteres.");
      if(!service(input.serviceId))fail("SERVICE","Escolha um serviço válido.");
      if(!compatible(input.serviceId,input.professionalId))fail("PROFESSIONAL","Escolha um profissional habilitado para esse serviço.");
      if(!parseDate(input.date))fail("DATE","Escolha uma data válida.");
      if(minutes(input.time)<0)fail("TIME","Escolha um horário da grade.");
      if(statuses.indexOf(input.status)===-1||(!previous&&input.status==="cancelado"))fail("STATUS","Crie o agendamento como pendente ou confirmado.");
      var record={id:id||"A"+String(nextId).padStart(3,"0"),client:client,serviceId:input.serviceId,professionalId:input.professionalId,date:input.date,time:input.time,status:input.status};
      var unchanged=isSameSchedule(previous,record);
      // O registro original pode ser consultado/editado/cancelado depois do horário.
      // Reativar um cancelamento ou alterar o período exige disponibilidade futura.
      var historicalOnly=unchanged&&previous&&(record.status==="cancelado"||previous.status!=="cancelado");
      if(!historicalOnly) {
        if(record.date<today())fail("PAST","Não é possível criar ou remarcar para uma data passada.");
        if(record.date>lastDate())fail("HORIZON","Escolha uma data dentro dos próximos "+config.bookingDays+" dias.");
        var chosen=slots(record.serviceId,record.professionalId,record.date,id).find(function(slot){return slot.time===record.time;});
        if(!chosen)fail("HOURS","Esse horário não comporta o serviço no expediente. Escolha outro horário.");
        if(!chosen.available)fail(chosen.reason==="Horário ocupado"?"CONFLICT":"PAST",chosen.reason==="Horário ocupado"?"Esse profissional já possui um agendamento nesse intervalo. Escolha outro horário.":"Esse horário já passou. Escolha outro horário.");
      }
      if(previous)records[records.findIndex(function(r){return r.id===id;})]=record;
      else {records.push(record);nextId++;}
      return clone(record);
    }
    function updateStatus(id,status) { var record=get(id);if(!record)fail("NOT_FOUND","Agendamento não encontrado.");record.status=status;return save(record,id); }
    function list(filters) { filters=filters||{};return records.filter(function(r){return (!filters.date||r.date===filters.date)&&(!filters.professionalId||r.professionalId===filters.professionalId)&&(!filters.status||r.status===filters.status);}).sort(function(a,b){return (a.date+a.time+a.id).localeCompare(b.date+b.time+b.id);}).map(clone); }
    function reset() {
      records=[];nextId=1;
      var firstService=config.services[0].id,firstProfessional=config.professionals.find(function(p){return p.services.indexOf(firstService)!==-1;});
      exampleDate=firstProfessional?firstDate(firstService,firstProfessional.id,addDays(today(),1)):today();
      if(options.seed===false)return;
      var samples=[
        ["corte","prof-a","confirmado",0],
        ["manicure","prof-b","pendente",0],
        ["sobrancelhas","prof-a","confirmado",0],
        ["pele","prof-c","confirmado",0],
        ["sobrancelhas","prof-b","pendente",0],
        ["corte","prof-a","pendente",1]
      ];
      samples.forEach(function(sample,index){
        if(!compatible(sample[0],sample[1]))return;
        var date=firstDate(sample[0],sample[1],addDays(exampleDate,sample[3]));if(!date)return;
        var at=slots(sample[0],sample[1],date).find(function(slot){return slot.available;});if(!at)return;
        var created=save({client:"Cliente de exemplo "+String(index+1).padStart(2,"0"),serviceId:sample[0],professionalId:sample[1],date:date,time:at.time,status:sample[2]});
        if(index===2)updateStatus(created.id,"cancelado");
      });
    }
    reset();
    return {today:today,lastDate:lastDate,config:function(){return clone(config);},exampleDate:function(){return exampleDate||today();},get:get,list:list,slots:slots,firstDate:firstDate,save:save,updateStatus:updateStatus,reset:reset};
  }
  return {createStore:createStore,defaultConfig:clone(DEFAULT_CONFIG),dateKey:dateKey,parseDate:parseDate,addDays:addDays,minutes:minutes,timeKey:timeKey};
}));
