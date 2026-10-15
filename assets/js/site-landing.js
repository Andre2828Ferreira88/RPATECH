(function () {
  "use strict";
  var promotion = document.getElementById("promotion");
  if (!promotion) return;
  // Prazo original da campanha. Não renova o desconto automaticamente a cada mês.
  var deadline = Date.parse(promotion.getAttribute("data-promotion-ends"));
  promotion.hidden = !Number.isFinite(deadline) || Date.now() > deadline;
}());
