
var DiceExpression = require("./src/DiceExpression.js");
var DieValue = require("./src/DieValue.js");

var dicepriority = 3;

var operators = {
    '*': { priority: 2, func: (x,y) => x*y },
    '+': { priority: 1, func: (x,y) => x+y },
    '-': { priority: 1, func: (x,y) => x-y },
    'd': { priority: dicepriority, func: (x,y) => new DiceExpression(x,y) },
    'b': { priority: dicepriority, func: (x,y) => x.best(y) },
    'w': { priority: dicepriority, func: (x,y) => x.worst(y) },
    '!': { priority: dicepriority, func: (x,y) => x.explode(y) },
    'h': { priority: dicepriority, func: (x,y) => { x.hit_on = y; return x; } },
    //miss
    //over
    //under
};

function do_next_operation(num_queue, op_queue, output) {
    var t2 = num_queue.pop();
    var t1 = num_queue.pop();
    var op = op_queue.pop();
    var result = op.func(t1, t2);
    num_queue.push(result);
    if ( op == operators['d'] ) {
        output.dice.push(result);
    }
}

function parse(expression) {
    var output = {
        dice: [],
        calculation: 0
    };
    var op_queue = [];
    var num_queue = [0];

    for( var i = 0; i < expression.length; i++ ) {
        var next_char = expression[i];
        if ( !isNaN(next_char) && !/\s/.test(next_char)) {
            num_queue.push( num_queue.pop() * 10 + Number(next_char) );
        }
        else {
            var next_op = operators[next_char];
            if ( next_op ) {
                while ( op_queue.length > 0 && next_op.priority <= op_queue[op_queue.length-1].priority ) {
                    do_next_operation(num_queue, op_queue, output);
                }//while there are higher priority ops already on the stack
                op_queue.push(next_op);
                num_queue.push(0); //if we've encountered an operator, next numbers are new numbers
            }//if there is an op for this character
        }//if the character is not a number
    }//for each character

    while ( op_queue.length > 0 ) {
        do_next_operation(num_queue, op_queue, output);
    }

    output.calculation = num_queue.pop();
    return output;
}//parse

module.exports = parse;


/*--- CLI Functions ---*/
function render_die_value(die_value) {
    var valid_char = (die_value.valid) ? '' : '~';
    var bonus_char = (die_value.bonus) ? '+' : '';
    return bonus_char + valid_char + die_value.raw_value + valid_char;
}

if ( require.main == module ) {
    var result =  parse(process.argv[2]);
    var diestring = result.dice.reduce((str, de) =>
        str + " " + de.toString() + ": [" + [...de].map(render_die_value).join(', ') + "]",
    '');
    console.log( "Rolling " + process.argv[2] + ": {" + diestring + "} = " + result.calculation);
}