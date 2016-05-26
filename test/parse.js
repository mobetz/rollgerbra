
var parse = require("../src/rollgerbra");

module.exports = {

    "arithmetic": {
        "Addition": function (test) {
            var result = parse("13+8");
            test.equals(result.calculation, 21);
            test.done();
        },
        "Subtraction":  function (test) {
            var result = parse("18-12");
            test.equals(result.calculation, 6);
            test.done();
        },
        "Multiplication":  function (test) {
            var result = parse("7*4");
            test.equals(result.calculation, 28);
            test.done();
        },
        "Order of Operations":  function (test) {
            var result = parse("2*7+13-8*5+2");
            test.equals(result.calculation, -11);
            test.done();
        }
    },
    "dice": {
      "Rolling": function (test) {
          var num_dice = 10;
          var num_sides = 6;
          var result = parse( num_dice + "d" + num_sides);
          var all_dice = result.dice.reduce((a, d) => a.concat(...d), []);
          var no_values_over_sides = all_dice.every((d) => d.raw_value <= num_sides );
          var dice_total = all_dice.reduce((s, d)=> s+d, 0);
          test.equals(all_dice.length, num_dice, "The wrong number of dice were rolled.");
          test.ok(no_values_over_sides, "Some of the dice rolled have too many sides.");
          test.equals(result.calculation, dice_total, "The returned sum does not match the sum of the returned dice.");
          test.done();
      },
      "Best": function (test) {
          var num_dice = 8;
          var num_sides = 10;
          var keep_count = 3;
          var result = parse( num_dice + "d" + num_sides + "b" + keep_count);
          var all_dice = result.dice.reduce((a, d) => a.concat(...d), []);
          var number_saved = all_dice.reduce((s, d)=>s+d.valid, 0);
          all_dice.sort((a,b) => b.raw_value - a.raw_value );
          var largest_dice_saved = all_dice.every((d, i)=>d.valid == (i < keep_count));
          test.equal(number_saved, keep_count, "The wrong number of dice were kept.");
          test.ok(largest_dice_saved, "The dice saved by best were not the largest.");
          test.done();
      }
    }
};
