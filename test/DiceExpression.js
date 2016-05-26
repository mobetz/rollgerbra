
var DiceExpression = require("../src/DiceExpression.js");

module.exports = {

    setUp: function (callback) {
        this.num_dice = 10;
        this.num_sides = 6;
        this.result = new DiceExpression(this.num_dice, this.num_sides);
        callback();
    },
    "DiceExpression": {
        "Constructor (die rolling)": function (test) {
            test.equals([...this.result].length, this.num_dice, "Creating a DiceExpression rolled an incorrect number of dice.");
            test.ok(this.result.sides === this.num_sides, "The number of sides stored in the DiceExpression is incorrect.");
            test.ok([...this.result].sort()[0] <= this.num_sides, "The highest value rolled in the DiceExpression's results is too high for the number of sides expected.");
            test.done();
        },
        "Exploding": function (test) {
            var explode_on = 4;
            this.result.explode(explode_on);
            var dice = [...this.result];
            var expected_dice = dice.reduce((i, v)=> i + (v >= explode_on), this.num_dice);
            test.equals(dice.length, expected_dice, "Ended up with " + dice.length + " rolled dice, but expected " + expected_dice + ".");
            test.done();
        },
        "Best": function (test) {
            var best_count = 3;
            this.result.best(best_count);
            var dice = [...this.result].sort((a,b)=>b-a);
            var saved_dice = dice.filter((die) => die.valid );
            var right_dice_saved = dice.every((die, index) => die.valid === (best_count > index));

            test.equals(saved_dice.length, best_count, "The wrong number of dice were saved.");
            test.ok(right_dice_saved, "The dice saved were not the best dice. Expected: " +
                "[" + dice.splice(0, best_count).join(", ") + "], but was: " +
                "[" + saved_dice.join(", ") + "]");
            test.done();
        },
        "Worst": function (test) {
            var worst_count = 3;
            this.result.worst(worst_count);
            var dice = [...this.result].sort((a,b)=>a.raw_value-b.raw_value);
            var saved_dice = dice.filter((die) => die.valid );
            var right_dice_saved = dice.every((die, index) => die.valid === (worst_count > index));

            test.equals(saved_dice.length, worst_count, "The wrong number of dice were saved.");
            test.ok(right_dice_saved, "The dice saved were not the worst dice. Expected: " +
                "[" + dice.splice(0, worst_count).map((d)=>d.raw_value).join(", ") + "], but was: " +
                "[" + saved_dice.join(", ") + "]");
            test.done();
        },
        "Hits": function (test) {
            var hit_on = 4;
            this.result.hits(hit_on);
            var dice = [...this.result];
            var hit_count = dice.filter((d)=>d.raw_value >= hit_on ).length;
            var right_dice_saved = dice.every((die)=> die.valid == (die.raw_value >= hit_on));
            test.equals(hit_count, this.result.valueOf(), "The wrong number of hits were calculated.");
            test.ok(right_dice_saved, "The wrong dice are considered valid hits.");
            test.done();
        }
    }
}
