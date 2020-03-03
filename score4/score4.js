var color = true;
var holes = "";
var receptor = "";
var generator = $("#generator");
var checkerArr = [];
var id = 0;

reset();

//create holes on the board
for (var i = 0; i < 42; i++) {
    var div = "<div class = 'n" + i + " hole'></div>";
    holes += div;
}
$("#board").html(holes);

//generate draggable checkers
function createChecker() {
    class Checker {
        constructor() {
            this.color = color;
            this.id = id;
        }

        create() {
            $("#generator").append("<div class= 'checker c" + this.id + "'></div>");
            var checker = $(".c" + this.id);
            checker.draggable();

            if (color) {
                checker.addClass("yellow");
            } else {
                checker.addClass("red");
            }
            color = !color;
            id++;
        }

        drop(recId, cPlayer) {
            var checker = $(".c" + this.id);
            for (var j = 1; j <= 6; j++) {
                if (
                    //bottom row
                    j == 1 &&
                    !$(".n" + (42 + recId - 7) + "").hasClass("red") &&
                    !$(".n" + (42 + recId - 7) + "").hasClass("yellow")
                ) {
                    checker.hide();
                    $(".n" + (42 + recId - 7) + "").addClass(cPlayer);
                    $(".n" + (42 + recId - 7 * j) + "").append(checker);
                    break;
                } else if (
                    //middle rows
                    !$(".n" + (42 + recId - 7 * j) + "").hasClass("red") &&
                    !$(".n" + (42 + recId - 7 * j) + "").hasClass("yellow")
                ) {
                    checker.hide();
                    $(".n" + (42 + recId - 7 * j) + "").addClass(cPlayer);
                    $(".n" + (42 + recId - 7 * j) + "").append(checker);
                    break;
                }
            }

            if (checker.is(":not(:hidden)")) {
                //if checker did not go into a column dont make a new one
                return;
            }
            //check win conditions for current player
            horizontal(cPlayer);
            vertical(cPlayer);
            diagonal(cPlayer);
            createChecker();
        }
    }

    var nextChecker = new Checker();
    nextChecker.create();
    checkerArr.push(nextChecker);
}

//create receptors above the board and drop checkers (listener for droppable)
for (var i = 0; i < 7; i++) {
    var div2 = "<div class = 'r" + i + " receptor'></div>";
    receptor += div2;
    $("#receptors").html(receptor);
    $(".receptor").droppable({
        accept: ".checker",
        drop: function(event, ui) {
            //find the receptor identifier (unique class)
            var rId;
            var cId;
            for (var i = 0; i < 7; i++) {
                if (this.classList.contains("r" + i)) {
                    rId = i;
                }
            }
            for (var i = 0; i <= id; i++) {
                if (ui.draggable[0].classList.contains("c" + i)) {
                    cId = i;
                    var cheCol;
                    if (checkerArr[cId].color) {
                        cheCol = "yellow";
                    } else {
                        cheCol = "red";
                    }
                    checkerArr[cId].drop(rId, cheCol);
                }
            }
        }
    });
}

//horizontal wins
function horizontal(cPlayer) {
    var count = 0;

    for (var i = 0; i < 42; i++) {
        if (i % 7 == 0) count = 0;
        if ($(".n" + i + "").hasClass(cPlayer)) {
            count++;
        } else {
            count = 0;
        }
        if (count == 4) {
            for (j = 0; j < 4; j++) {
                $(".n" + (i - j) + "").addClass("win");
            }
            win(cPlayer);
            break;
        }
    }
}

//vertical wins
function vertical(cPlayer) {
    var count = 0;
    // loop through each column
    for (var i = 0; i < 7; i++) {
        count = 0;
        // loop through the rows by adding 7
        for (var j = 0; j < 42; j += 7) {
            if ($(".n" + (i + j) + "").hasClass(cPlayer)) {
                count++;
            } else {
                count = 0;
            }
            if (count == 4) {
                for (var k = 0; k < 4; k++) {
                    $(".n" + (i + j - 7 * k) + "").addClass("win");
                }
                win(cPlayer);
                break;
            }
        }
    }
}

//diagonal wins
function diagonal(cPlayer) {
    var count = 0;

    //downwards
    for (var i = 0; i < 21; i++) {
        count = 0;
        for (var j = 0; j <= 42; j += 8) {
            // check if the pointer (i+j) if in the first column
            if ((i + j) % 7 == 0) count = 0;
            if ($(".n" + (i + j) + "").hasClass(cPlayer)) {
                count++;
            } else {
                count = 0;
            }
            if (count == 4) {
                for (var k = 0; k < 4; k++) {
                    $(".n" + (i + j - 8 * k) + "").addClass("win");
                }
                win(cPlayer);
                break;
            }
        }
    }
    //upwards
    for (var i = 0; i < 21; i++) {
        count = 0;
        for (var j = 0; j <= 42; j += 6) {
            if ($(".n" + (i + j) + "").hasClass(cPlayer)) {
                count++;
            } else {
                count = 0;
            }
            if (count == 4) {
                for (var k = 0; k < 4; k++) {
                    $(".n" + (i + j - 6 * k) + "").addClass("win");
                }
                win(cPlayer);
                break;
            }
            // check if the pointer (i+j) if in the first column
            if ((i + j) % 7 == 0) count = 0;
        }
    }
}

//win function
function win(cPlayer) {
    if (cPlayer == "red") {
        $("#rwins").show();
    } else {
        $("#ywins").show();
    }
    $("#reset").show();
}

//reset board
$("#reset").click(function() {
    reset();
});

function reset() {
    $(".checker").remove();
    $(".hole").removeClass("red");
    $(".hole").removeClass("yellow");
    $(".hole").removeClass("win");
    $("#rwins").hide();
    $("#ywins").hide();
    $("#reset").hide();
    checkerArr = [];
    id = 0;
    color = true;
    createChecker();
}

//play checkers into random slots
function playRandom(interval, restartMe) {
    var cheCol;
    //check if anyone has won or the board is full
    if (id > 42 || $("#reset").is(":not(:hidden)")) {
        if (restartMe) {
            setTimeout(function() {
                reset();
                playRandom(interval, restartMe);
            }, Math.max(1500, interval * 3));
        }
        return;
    }
    // figure out the color of the dropped checker
    if (checkerArr[checkerArr.length - 1].color) {
        cheCol = "yellow";
    } else {
        cheCol = "red";
    }
    var num1_7 = Math.floor(Math.random() * 7); //integer between 1 and 7
    checkerArr[checkerArr.length - 1].drop(num1_7, cheCol);
    setTimeout(function() {
        // repeat the function with the same parameters
        playRandom(interval, restartMe);
    }, interval);
}

//keyboard input
document.addEventListener("keyup", function(event) {
    if (event.key >= 1 && event.key <= 7) {
        var cheCol;
        if (checkerArr[checkerArr.length - 1].color) {
            cheCol = "yellow";
        } else {
            cheCol = "red";
        }
        checkerArr[checkerArr.length - 1].drop(event.key - 1, cheCol);
    }
    if (event.key == "r") reset();
});
