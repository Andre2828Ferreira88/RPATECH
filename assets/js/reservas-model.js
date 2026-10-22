/* Modelo local da demonstração. Não possui backend, envio automático ou armazenamento. */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RPAReservationsDemo = factory();
}(typeof window !== "undefined" ? window : this, function () {
  "use strict";
  var statuses = ["pendente", "confirmada", "cancelada"];
  var shifts = ["almoco", "jantar", "evento"];
  function dateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    var parts = value.split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2], 12);
    return parts[0] >= 2000 && parts[0] <= 2100 && dateKey(date) === value;
  }
  function phoneNumber(input) {
    var raw = String(input || "").trim();
    if (!raw) return "";
    if (!/^[\d\s()+.\-]+$/.test(raw)) throw new Error("Informe um telefone brasileiro válido ou deixe o contato vazio.");
    var digits = raw.replace(/\D/g, "");
    if ((digits.length === 12 || digits.length === 13) && digits.slice(0, 2) === "55") digits = digits.slice(2);
    if (!/^[1-9]\d[2-9]\d{7,8}$/.test(digits) || (digits.length === 11 && digits[2] !== "9")) throw new Error("Informe um telefone com DDD válido ou deixe o contato vazio.");
    return "55" + digits;
  }
  function validate(input) {
    var name = String(input.name || "").trim();
    var notes = String(input.notes || "").trim();
    if (name.length < 2 || name.length > 80) throw new Error("O nome deve ter de 2 a 80 caracteres.");
    if (!validDate(input.date)) throw new Error("Escolha uma data válida entre 2000 e 2100.");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time || "")) throw new Error("Informe um horário válido.");
    var people = Number(input.people);
    if (!Number.isInteger(people) || people < 1 || people > 5000) throw new Error("Informe uma quantidade inteira entre 1 e 5.000 pessoas.");
    if (shifts.indexOf(input.shift) === -1) throw new Error("Escolha o turno da reserva.");
    if (statuses.indexOf(input.status) === -1) throw new Error("Escolha um status válido.");
    if (notes.length > 500) throw new Error("Use até 500 caracteres nas observações.");
    return {name:name, phone:phoneNumber(input.phone), date:input.date, time:input.time, people:people, shift:input.shift, status:input.status, notes:notes};
  }
  function normalize(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  function createStore(referenceDate) {
    var reference = referenceDate ? new Date(referenceDate.getTime()) : new Date();
    var today = dateKey(reference);
    var reservations, nextId;
    function day(offset) { var d = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() + offset, 12); return dateKey(d); }
    function reset() {
      // Pessoas, grupos e pedidos fictícios. Contatos de terceiros não são inventados.
      reservations = [
        {id:"R001",name:"Marina · exemplo",phone:"",date:day(0),time:"12:30",people:12,shift:"almoco",status:"confirmada",notes:"Grupo fictício. Mesa próxima à janela, se disponível."},
        {id:"R002",name:"Equipe Horizonte · exemplo",phone:"",date:day(0),time:"19:30",people:28,shift:"jantar",status:"pendente",notes:"Confraternização fictícia. A equipe ainda precisa verificar a disponibilidade."},
        {id:"R003",name:"Rafael · exemplo",phone:"",date:day(0),time:"20:00",people:6,shift:"jantar",status:"confirmada",notes:"Pedido fictício para demonstrar a edição de uma reserva."},
        {id:"R004",name:"Grupo Estação · exemplo",phone:"",date:day(1),time:"18:00",people:45,shift:"evento",status:"pendente",notes:"Evento fictício. Detalhes a combinar manualmente."},
        {id:"R005",name:"Beatriz · exemplo",phone:"",date:day(1),time:"13:00",people:8,shift:"almoco",status:"cancelada",notes:"Cancelamento fictício para demonstração do filtro de status."},
        {id:"R006",name:"Luiza · exemplo",phone:"",date:day(3),time:"12:00",people:16,shift:"almoco",status:"pendente",notes:"Solicitação fictícia de reserva para um grupo."},
        {id:"R007",name:"Confraternização · exemplo",phone:"",date:day(6),time:"19:00",people:32,shift:"evento",status:"confirmada",notes:"Exemplo de evento confirmado manualmente."}
      ];
      nextId = 8;
    }
    function get(id) { var record = reservations.find(function (r) { return r.id === id; }); return record ? Object.assign({}, record) : null; }
    function list(filters) {
      filters = filters || {};
      return reservations.filter(function (r) {
        return (!filters.date || r.date === filters.date) && (!filters.shift || r.shift === filters.shift) && (!filters.status || r.status === filters.status) && (!filters.search || normalize(r.name + " " + r.id).indexOf(normalize(filters.search).trim()) !== -1);
      }).sort(function (a,b) { return (a.date + a.time + a.id).localeCompare(b.date + b.time + b.id); }).map(function (r) { return Object.assign({},r); });
    }
    function save(input, id) {
      var clean = validate(input);
      if (id) {
        var index = reservations.findIndex(function (r) { return r.id === id; });
        if (index === -1) throw new Error("Esta reserva não foi encontrada. Reinicie a demonstração.");
        clean.id = id;
        reservations[index] = clean;
      } else {
        clean.id = "R" + String(nextId++).padStart(3,"0");
        reservations.push(clean);
      }
      return Object.assign({},clean);
    }
    function updateStatus(id, status) {
      if (statuses.indexOf(status) === -1) throw new Error("Status inválido.");
      var record = get(id);
      if (!record) throw new Error("Reserva não encontrada.");
      record.status = status;
      return save(record, id);
    }
    function summary(records) {
      return records.reduce(function (out,r) { out.total++;out[r.status]++;if(r.status!=="cancelada")out.people+=r.people;return out; }, {total:0,pendente:0,confirmada:0,cancelada:0,people:0});
    }
    reset();
    return {today:today,get:get,list:list,save:save,updateStatus:updateStatus,summary:summary,reset:reset};
  }
  return {createStore:createStore,dateKey:dateKey,validDate:validDate,phoneNumber:phoneNumber};
}));
