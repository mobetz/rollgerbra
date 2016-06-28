

function DieValue (sides) {
    this.raw_value = Math.ceil(Math.random() * sides);
    this.valid = true;
    this.bonus = false;
}

DieValue.prototype.valueOf = function () {
    return ( this.valid ) ? this.raw_value : 0;
};

DieValue.prototype.toString = function () {
    return String(this.valueOf());
};

module.exports = DieValue;