const withdrawAmountStr = '3200000';
const amountPower = withdrawAmountStr.slice(-1);
let withdrawAmount = 0;
if (amountPower === 'K' || amountPower === 'k') {
	withdrawAmount = parseFloat(withdrawAmountStr.slice(0, -1)) * 1000;
}
else if (amountPower === 'M' || amountPower === 'm') {
	withdrawAmount = parseFloat(withdrawAmountStr.slice(0, -1)) * 1000000;
}
else if (amountPower === 'B' || amountPower === 'b') {
	withdrawAmount = parseFloat(withdrawAmountStr.slice(0, -1)) * 1000000000;
}
else if (!isNaN(withdrawAmountStr)) {
	withdrawAmount = parseFloat(withdrawAmountStr);
}

console.log(withdrawAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
