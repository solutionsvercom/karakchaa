const Counter = require("../models/System/CounterSchema");

function todayIstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function tokenCounterKey() {
  return `token_${todayIstDate()}`;
}

function formatTokenNumber(seq) {
  return String(seq);
}

async function peekNextTokenNumber() {
  const counter = await Counter.findOne({ key: tokenCounterKey() }).lean();
  return formatTokenNumber((counter?.seq || 0) + 1);
}

async function generateNextTokenNumber() {
  const counter = await Counter.findOneAndUpdate(
    { key: tokenCounterKey() },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();
  return formatTokenNumber(counter.seq);
}

module.exports = {
  peekNextTokenNumber,
  generateNextTokenNumber,
  formatTokenNumber,
};
