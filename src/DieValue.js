

function DieValue (sides) {
    this.raw_value = Math.floor(Math.random() * sides) + 1;
    this.valid = true;
}

DieValue.prototype.valueOf = function () {
    return ( this.valid ) ? this.raw_value : 0;
};

DieValue.prototype.toString = function () {
    return String(this.valueOf());
};

module.exports = DieValue;