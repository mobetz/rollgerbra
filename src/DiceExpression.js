var DieValue = require("./DieValue.js");

function DiceExpression (quantity, sides) {
    this.sides = sides;
    this.rolled_values = roll(quantity, sides);
    this.dice_string = quantity + "d" + sides;
    this.hit_on = -1;
    this.miss_on = -1;
}

/* --- PRIVATE METHODS --- */
function roll(quantity, sides) {
    var rolls = [];
    for (var i = 0; i < quantity; i++) {
        rolls.push(new DieValue(sides));
    }
    return rolls;
}

function count_successes(dice, target) {
    return dice.reduce(function (running_total, next_roll) {
        return running_total + ( next_roll >= target );
    }, 0);
}


/* --- PUBLIC METHODS --- */
DiceExpression.prototype.explode = function (over) {
    var exploding_count = count_successes(this.rolled_values, over);
    if ( exploding_count > 0 ) {
        var extra_rolls = new DiceExpression(exploding_count, this.sides);
        extra_rolls = [...extra_rolls.explode(over)].map((r) => {
            r.bonus = true;
            return r;
        });
        this.rolled_values = this.rolled_values.concat(extra_rolls);
    }
    return this;
};

DiceExpression.prototype.best = function (count) {
    var excluded_dice = this.rolled_values.filter((v)=>v.valid).sort((a,b) => b-a).slice(count);
    excluded_dice.forEach((d) => d.valid = false);
    return this;
};

DiceExpression.prototype.worst = function (count) {
    var excluded_dice = this.rolled_values.filter((v)=>v.valid).sort((a,b) =>  a-b).slice(count);
    excluded_dice.forEach((d) => d.valid = false);
    return this;
};

/* --- JAVASCRIPT INTERFACES --- */
DiceExpression.prototype[Symbol.iterator] = function ()
{
    var self = this;
    var i = 0;
    return {
        next: function () {
            return {
                value: self.rolled_values[i++],
                done: i > self.rolled_values.length
            };
        }
    };
};
DiceExpression.prototype.entries = DiceExpression.prototype[Symbol.iterator];


DiceExpression.prototype.valueOf = function () {
    var total = 0;
    if ( this.hit_on > 0 ) {
        total = count_successes(this.rolled_values, this.hit_on);
    }
    else {
        total = this.rolled_values.reduce(function (running_total, next_roll) {
            return running_total + next_roll;
        }, 0);
    }
    return total;
};


DiceExpression.prototype.toString = function() {
  return this.dice_string;
};

module.exports = DiceExpression;