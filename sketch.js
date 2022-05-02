let vInInput;
let vGoalInput;
let r1Input;
let r1Select;
let r1Multiplier = 1.0;
let r2Input;
let r2Select;
let vOutInput;
let ampInput;
let ampMultiplier = 1;
let ampSelect;
let wattInput;

function setup() {
  createCanvas(0,0);
  let container = select("#vin");
  let span = createSpan(" Vin ");
  span.parent(container);

  vInInput = createInput(String(24.0));
  vInInput.changed(vInInputChanged);
  vInInput.parent(container);
  let vUnitSelect = createSelect();
  vUnitSelect.option("V");
  vUnitSelect.parent(container);
  vUnitSelect.attribute("disabled", "true");


  container = select("#vgoal");
  span = createSpan(" Vgoal ");
  span.parent(container);

  vGoalInput = createInput(String(5.0));
  vGoalInput.changed(vGoalInputChanged);
  vGoalInput.parent(container);
  
  vUnitSelect = createSelect();
  vUnitSelect.option("V");
  vUnitSelect.parent(container);
  vUnitSelect.attribute("disabled", "true");

  container = select("#r1");
  span = createSpan(" R1 ");
  span.parent(container);

  r1Input = createInput(String(100));
  r1Input.changed(r1InputChanged);
  r1Input.parent(container);

  r1Select = createSelect();
  r1Select.option("Ω");
  r1Select.option("kΩ");
  r1Select.option("MΩ");
  r1Select.changed(r1SelectChanged);
  r1Select.parent(container);


  container = select("#r2");
  span = createSpan(" R2 ");
  span.parent(container);

  r2Input = createInput();
  r2Input.parent(container);
  r2Input.attribute("readonly", "true");
  
  r2Select = createSelect();
  r2Select.option("Ω");
  r2Select.option("kΩ");
  r2Select.option("MΩ");
  r2Select.parent(container);
  r2Select.attribute("disabled", "true");
  
  
  container = select("#vout");
  span = createSpan(" Vreal ");
  span.parent(container);
  
  vOutInput = createInput();
  vOutInput.parent(container);
  vOutInput.attribute("readonly", "true");
  
  vUnitSelect = createSelect();
  vUnitSelect.option("V");
  vUnitSelect.parent(container);
  vUnitSelect.attribute("disabled", "true");
  
  container = select("#amps");
  span = createSpan(" Current ");
  span.parent(container);
  
  ampInput = createInput();
  ampInput.parent(container);
  ampInput.attribute("readonly", "true");
  
  ampSelect = createSelect();
  ampSelect.option("mA");
  ampSelect.option("A");
  ampSelect.parent(container);
  ampSelect.attribute("disabled", "true");
  
  
  container = select("#watts");
  span = createSpan(" Power ");
  span.parent(container);
  
  wattInput = createInput();
  wattInput.parent(container);
  wattInput.attribute("readonly", "true");
  
  vUnitSelect = createSelect();
  vUnitSelect.option("W");
  vUnitSelect.parent(container);
  vUnitSelect.attribute("disabled", "true");
  
  
  compute();
}

function draw() {
}

function vInInputChanged() {compute();}
function vGoalInputChanged() {compute();}
function r1InputChanged() {compute();}
function r1SelectChanged() {
  if (this.value() == "Ω") {
    r1Multiplier = 1.0;
  }
  if (this.value() == "kΩ") {
    r1Multiplier = 1000.0;
  }
  if (this.value() == "MΩ") {
    r1Multiplier = 1000.0 * 1000.0;
  }
  compute();
}

function r2InputChanged() {}

function compute(){
  let vIn = vInInput.value();
  let vGoal = vGoalInput.value();
  let r1 = r1Input.value() * r1Multiplier;
  r1 = EIAValues(r1,10);
  r1Input.value(r1/r1Multiplier)
  
  r2Select.selected(r1Select.value());
  let r2 = (vGoal*r1) / (vIn-vGoal);
  r2 = EIAValues(r2,10);
  r2 = r2;
  r2Input.value(r2/r1Multiplier);
  
  let vOut = vIn * (r2 / (r1 + r2));
  vOut = vOut.toPrecision(4);
  vOutInput.value(vOut);
  
  let amp = vIn/(r1+r2);
  
  if(amp < 1.0){
      ampInput.value((amp/0.001).toPrecision(4));
      ampSelect.selected("mA");
  }
  else{
      ampInput.value(amp);
      ampSelect.selected("A");
  }
  
  wattInput.value((amp*vIn).toPrecision(4));
}






function log10(val) {
  return Math.log(val) / Math.LN10;
}

function EIAValues(val, tolerance) {
  var series;

  if (tolerance == 20) series = 6;
  else if (tolerance == 10) series = 12;
  else if (tolerance == 5) series = 24;
  else if (tolerance == 2) series = 48;
  else if (tolerance == 1) series = 96;
  else series = 192;

  var l = log10(val);

  var decplaces = series < 48 ? 10 : 100;

  var pref_val = (Math.round((Math.pow(10, (Math.round(series * l) / series)) / Math.pow(10, Math.floor(log10((Math.pow(10, (Math.round(series * l) / series))))))) * decplaces) / decplaces) * Math.pow(10, Math.floor(log10((Math.pow(10, (Math.round(series * l) / series))))));

  // compensate for possible precision loss in the above calculation
  var rounded = Math.round(pref_val);
  var abs = Math.abs(rounded - pref_val);
  if (abs > 0.999 || abs < 0.0001)
    pref_val = rounded;

  if (pref_val >= 260 && pref_val <= 460) pref_val += 10; // fix for E24/E12/E6 series   
  else if (pref_val == 830) pref_val -= 10; // fix for E24/E12/E6 series
  else if (pref_val == 919) pref_val++; // fix for E192 series

  return pref_val;
}