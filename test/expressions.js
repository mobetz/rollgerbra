
var DiceExpression = require("../src/DiceExpression.js");

module.exports = {

    setUp: function (callback) {
        this.num_dice = 10;
        this.num_sides = 6;
        this.result = new DiceExpression(this.num_dice, this.num_sides);
        callback();
    },
    "operators": {
        "Dice Rolling": function (test) {
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
            test.equals([...this.result].length, this.num_dice);
            test.done();
        }
    }
}
