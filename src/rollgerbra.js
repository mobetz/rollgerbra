
var DiceExpression = require("./DiceExpression.js");
var DieValue = require("./DieValue.js");

var dicepriority = 3;

var operators = {
    '*': { priority: 2, func: (x,y) => x*y },
    '+': { priority: 1, func: (x,y) => x+y },
    '-': { priority: 1, func: (x,y) => x-y },
    'd': { priority: dicepriority, func: (x,y) => new DiceExpression(x,y) },
    'b': { priority: dicepriority, func: (x,y) => x.best(y) },
    'w': { priority: dicepriority, func: (x,y) => x.worst(y) },
    '!': { priority: dicepriority, variadic: true, func: (x,y) => { y = y || x.sides; return x.explode(y) } },
    'h': { priority: dicepriority, func: (x,y) => x.hits(y) },
    //miss
    //over
    //under
};

function do_next_operation(num_queue, variadic_queue, op_queue, output) {
    var op = op_queue.pop();
    var result;
    if ( op.variadic ) {
        result = variadic_operation(num_queue, variadic_queue, op);
    }
    else {
        result = binary_operation(num_queue, op);
    }
    //whatever the result of our operation was becomes the first argument to the next operator
    //note: this won't work for nested variadic functions, but the solution for that is uglier
    num_queue.push(result);
    //we want to preserve references to any dice expressions in case users want to show
    //raw rolled values in their output. So if the operation we did was a roll, add a reference to the reuslt
    if ( op == operators['d'] ) {
        output.dice.push(result);
    }
}

function binary_operation(num_queue, op) {
    var t2 = num_queue.pop();
    var t1 = num_queue.pop();
    var result = op.func(t1, t2);
    return result;
}

function variadic_operation(num_queue, variadic_queue, op) {
    var t1 = num_queue.pop();
    //note: this won't work for variadic functions operating as binary functions whose second argument is 0
    //fortunately, this isn't relevant in the case of dice notation (where arguments of 0 are generally meaningless)
    var tn = (variadic_queue.length > 1 || variadic_queue[0] != 0) ? variadic_queue : [];
    var result = op.func(t1, ...tn);
    //clear the variadic queue, as we just used everything on it.
    //note: this won't work for nested variadic functions, but the solution for that is uglier
    variadic_queue.length = 0;
    return result;
}

/*
    Use a modified Shunting Yard algorithm to calculate the value of a given dice expression.
 */
function parse(expression) {
    var output = {
        dice: [],
        calculation: 0
    };
    var op_queue = [];
    var num_queue = [0];
    var variadic_queue = [];
    //the "active queue" is the queue constants should be pushed to. For variadic functions,
    //we can detect how many arguments belong to them by the size of their queue.
    var active_number_queue = num_queue;

    //step through characters left-to-right, pushing them to the queue that represents their symbol type
    for( var i = 0; i < expression.length; i++ ) {
        var next_char = expression[i];

        if ( !isNaN(next_char) && !/\s/.test(next_char)) {
            active_number_queue.push( active_number_queue.pop() * 10 + Number(next_char) );
        }
        else {
            var next_op = operators[next_char];
            if ( next_op ) {
                //if the next function is variadic, all numbers until the next op will be pushed to a temporary queue instead
                active_number_queue = (next_op.variadic) ? variadic_queue : num_queue;
                //do any previously pushed ops with higher or equal priority, as nothing new can affect them
                while ( op_queue.length > 0 && next_op.priority <= op_queue[op_queue.length-1].priority ) {
                    do_next_operation(num_queue, variadic_queue, op_queue, output);
                }//while there are higher priority ops already on the stack
                op_queue.push(next_op);
                active_number_queue.push(0); //if we've encountered an operator, next numbers are new numbers
            }//if there is an op for this character
            else {
                throw `Specified an invalid operation: ${next_char}`;
            }
        }//if the character is not a number
    }//for each character

    //do any leftover operations
    while ( op_queue.length > 0 ) {
        do_next_operation(num_queue, variadic_queue, op_queue, output);
    }

    //the last thing left on the number queue is the final total, so pop it off and send it to the user
    output.calculation = Number(num_queue.pop());
    return output;
}//parse

module.exports = parse;


/*--- CLI Functions ---*/
function render_die_value(die_value) {
    var valid_char = (die_value.valid) ? '' : '~~';
    var bonus_char = (die_value.bonus) ? '*' : '';
    return bonus_char + valid_char + die_value.raw_value + valid_char + bonus_char;
}

if ( require.main == module ) {
    if ( !process.argv[2]) {
        throw `Usage: rollgerbra [expression]`;
    }
    var roll =  parse(process.argv[2]);
    var diestring = roll.dice.reduce((str, de) =>
        str + " " + de.toString() + ": [" + [...de].map(render_die_value).join(', ') + "]",
    '');
    console.log( "Rolling " + process.argv[2] + ": {" + diestring + "} = " + roll.calculation);
}
