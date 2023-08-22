/* ************************************ */
/* Helper Functions                     */
/* ************************************ */
var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('single-stim-button')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	for (var i = 0; i < experiment_data.length; i++) {
		rt = experiment_data[i].rt
		trial_count += 1
		if (rt == -1) {
			missed_count += 1
		} else {
			rt_array.push(rt)
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	var missed_percent = missed_count/experiment_data.length
  	credit_var = (missed_percent < 0.4 && avg_rt > 200)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var,
									"performance_var": performance_var})
}

function deleteText(input, search_term) {
	index = input.indexOf(search_term)
	indexAfter = input.indexOf(search_term) + search_term.length
	return input.slice(0, index) + input.slice(indexAfter)
}


function appendTextAfter(input, search_term, new_text) {
	var index = input.indexOf(search_term) + search_term.length
	return input.slice(0, index) + new_text + input.slice(index)
}

function appendTextAfter2(input, search_term, new_text, deleted_text) {
	var index = input.indexOf(search_term) + search_term.length
	var indexAfter = index + deleted_text.length
	return input.slice(0, index) + new_text + input.slice(indexAfter)
}

var getBoard = function(board_type) {
	var board = ''
	if (board_type == 2) {
		board = "<div class = cardbox>"
		for (i = 1; i < 33; i++) {
			board += "<div class = square><input type='image' id = " + i +
				" class = 'card_image' src='images/final_closed.png' style='width:70px; height:70px;' onclick = instructCard(this.id)></div>"
		}

	} else {
		board = "<div class = cardbox>"
		// Tarek: Here is where we choose card
		for (i = 1; i < 33; i++) {
			board += "<div class = square><input type='image' id = " + i +
				" class = 'card_image select-button' src='images/final_closed.png' style='width:70px; height:70px;' onclick = chooseCard(this.id)></div>"
		}
	}
	board += "</div>"
	return board
}


var episodeEndText = function() {
	return '<div class = centerbox><p class = block-text>In der vorhergegangenen Kondition haben Sie ' + formatAmount(totalPoints) + ' gewonnen' +
		'</p><p class = block-text>Press <strong>enter</strong> to continue.</p></div>'
}

var appendPayoutData = function(){
	jsPsych.data.addDataToLastTrial({reward: [prize1, prize2, prize3]})
}

var appendTestData = function() {
	jsPsych.data.addDataToLastTrial({
		which_round: whichRound,
		num_click_in_round: whichClickInRound,
		num_loss_cards: numLossCards,
		gain_amount: gainAmt,
		loss_amount: lossAmt,
		round_points: roundPoints,
		clicked_on_loss_card: lossClicked,
		round_type: round_type
	})
}

// Functions for "top" buttons during test (no card, end round, collect)
var collect = function() {
	for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	currID = 'collectButton'
	whichClickInRound = whichClickInRound + 1
}

var noCard = function() {
	currID = 'noCardButton'
	roundOver = 2
	whichClickInRound = whichClickInRound + 1
}

var endRound = function() {
	currID = 'endRoundButton'
	roundOver = 2
}

// Clickable card function during test
var chooseCard = function(clicked_id) {
	currID = parseInt(clicked_id)
	whichClickInRound = whichClickInRound + 1
	// Tarek: Need to understand these two conditions
	// will add logic here that decrements the number of clicks until we hit the number we generated

	console.log("whichClickInRound: ", whichClickInRound)
	console.log("clicked_id: ", clicked_id)
	console.log("whichRound: ", whichRound)
	console.log("lossClickAt: ", lossClickAt)
	// [Tarek] Old condition: if ((clickedGainCards.length+1) == whichLossCards) {
	if (whichClickInRound == lossClickAt) {
		// Tarek: Loss card clicked
		console.log("== My new condition of checking if clicks hit number of loss cards in there")
		clickedLossCards.push(currID)
		index = unclickedCards.indexOf(currID, 0)
		unclickedCards.splice(index, 1)
		roundPoints = roundPoints - lossAmt
		lossClicked = true
		roundOver = 2
	} else { // if you click on a gain card
		clickedGainCards.push(currID) //as a string
		index = unclickedCards.indexOf(currID, 0)
		unclickedCards.splice(index, 1)
		roundPoints = roundPoints + gainAmt
	}
}

var formatAmount = function(amount) {
	return amount/100 + " €"
}

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var getRound = function() {
	console.log("-- INSIDE get roundd")
	var gameState = gameSetup
	if (roundOver === 0) { //this is for the start of a round
		whichClickInRound = 0
		unclickedCards = cardArray
		cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
			24, 25, 26, 27, 28, 29, 30, 31, 32
		]
		clickedGainCards = [] //num
		clickedLossCards = [] //num
		roundParams = shuffledParamsArray.shift()
		numLossCards = 1
		gainAmt = roundParams[1]
		lossAmt = roundParams[2]

		gameState = appendTextAfter(gameState, 'playing for ', playingFor)
		gameState = appendTextAfter(gameState, 'Game Round: ', whichRound)
		// gameState = appendTextAfter(gameState, 'Loss Amount: ', lossAmt)
		gameState = appendTextAfter2(gameState, 'Temporary Account: ', formatAmount(roundPoints), '0')
		gameState = appendTextAfter2(gameState, 'Global Account: ', formatAmount(totalEpisodePoints), '0')
		// gameState = appendTextAfter(gameState, 'Number of Loss Cards: ', numLossCards)
		gameState = appendTextAfter(gameState, 'Gain Amount: ', formatAmount(gainAmt))
		gameState = appendTextAfter(gameState, "endRound()", " disabled")
		roundOver = 1
		return gameState
	} else if (roundOver == 1) { //this is for during the round
		gameState = appendTextAfter(gameState, 'playing for ', playingFor)
		gameState = appendTextAfter(gameState, 'Game Round: ', whichRound)
		// gameState = appendTextAfter(gameState, 'Loss Amount: ', lossAmt)
		gameState = appendTextAfter2(gameState, 'Temporary Account: ', formatAmount(roundPoints), '0')
		gameState = appendTextAfter2(gameState, 'Global Account: ', formatAmount(totalEpisodePoints), '0')
		// gameState = appendTextAfter(gameState, 'Number of Loss Cards: ', numLossCards)
		gameState = appendTextAfter(gameState, 'Gain Amount: ', formatAmount(gainAmt))
		gameState = appendTextAfter(gameState, "noCard()", " disabled")
		gameState = appendTextAfter2(gameState, "class = 'CCT-btn "," ' disabled", "select-button' onclick = noCard()")
		for (i = 0; i < clickedGainCards.length; i++) {
			gameState = appendTextAfter2(gameState, "id = " + "" + clickedGainCards[i] + ""," class = 'card_image' src='images/final_coin.png' style='width:70px; height:70px;'", " class = 'card_image select-button' src='images/final_closed.png' style='width:70px; height:70px;' onclick = chooseCard(this.id)")
		}
		return gameState
	} else if (roundOver == 2) { //this is for end the round
		roundOver = 3
		gameState = appendTextAfter(gameState, 'playing for ', playingFor)
		gameState = appendTextAfter(gameState, 'Game Round: ', whichRound)
		// gameState = appendTextAfter(gameState, 'Loss Amount: ', lossAmt)
		gameState = appendTextAfter2(gameState, 'Temporary Account: ', formatAmount(roundPoints), '0')
		gameState = appendTextAfter2(gameState, 'Global Account: ', formatAmount(totalEpisodePoints), '0')
		// gameState = appendTextAfter(gameState, 'Number of Loss Cards: ', numLossCards)
		gameState = appendTextAfter(gameState, 'Gain Amount: ', formatAmount(gainAmt))
		gameState = appendTextAfter2(gameState, "id = collectButton class = 'CCT-btn", " select-button' onclick = collect()", "'")
		gameState = appendTextAfter(gameState, "endRound()", " disabled")
		gameState = appendTextAfter(gameState, "noCard()", " disabled")
		
		clickedCards = clickedGainCards.concat(clickedLossCards)
		var notClicked = cardArray.filter(function(x) { return (jQuery.inArray(x,clickedCards) == -1)})
		notClicked = jsPsych.randomization.shuffle(notClicked)
		lossCardsToTurn = notClicked.slice(0,numLossCards-clickedLossCards.length)
		gainCardsToTurn = notClicked.slice(numLossCards-clickedLossCards.length)
		for (var i = 1; i < cardArray.length + 1; i++) {
			if (clickedGainCards.indexOf(i) != -1 ) {
				gameState = appendTextAfter2(gameState, "id = " + "" + i + ""," class = 'card_image' src='images/final_coin.png' style='width:70px; height:70px;'", " class = 'card_image select-button' src='images/final_closed.png' style='width:70px; height:70px;' onclick = chooseCard(this.id)")
			} else if (clickedLossCards.indexOf(i) != -1 ) {
				gameState = appendTextAfter2(gameState, "id = " + "" + i + ""," class = 'card_image' src='images/final_lion.png' style='width:70px; height:70px;'", " class = 'card_image select-button' src='images/final_closed.png' style='width:70px; height:70px;' onclick = chooseCard(this.id)")
			} else {
				gameState = appendTextAfter2(gameState, "id = " + "" + i + ""," class = 'card_image' src='images/final_closed.png' style='width:70px; height:70px;'", " class = 'card_image select-button' src='images/final_closed.png' style='width:70px; height:70px;' onclick = chooseCard(this.id)")
			}
		}
		
		setTimeout(function() {
			for (var k = 0; k < lossCardsToTurn.length; k++) {
				document.getElementById('' + lossCardsToTurn[k] + '').src =
				'images/final_lion.png';
			}
			for (var j = 0; j < gainCardsToTurn.length; j++) {
				document.getElementById('' + gainCardsToTurn[j] + '').src =
				'images/final_coin.png';
			}
			$('#collectButton').prop('disabled', false)
		}, 10)

		return gameState
	}
}

/*Functions below are for practice
*/
var turnCards = function(cards) {

	$('#collectButton').prop('disabled', false)
	$('#NoCardButton').prop('disabled', true)
	for (i = 0; i < 33; i++) {
		if (whichGainCards.indexOf(i) != -1) {
			document.getElementById('' + i + '').src =
				'images/final_coin.png';
		} else if (whichLossCards.indexOf(i) != -1) {
			document.getElementById('' + i + '').src =
				'images/final_lion.png';
		}
	}
}

var turnOneCard = function(whichCard, win) {
	if (win === 'loss') {
		document.getElementById("" + whichCard + "").src =
			'images/final_lion.png';
	} else {
		document.getElementById("" + whichCard + "").src =
			'images/final_coin.png';
	}
}

function doSetTimeout(card_i, delay, points, totalEpisodePoints, win) {
	CCT_timeouts.push(setTimeout(function() {
		turnOneCard(card_i, win);
		document.getElementById("current_round").innerHTML = 'Temporary Account: ' + points
		document.getElementById("global_account").innerHTML = 'Global Account: ' + totalEpisodePoints
	}, delay));
}

var getPractice1 = function() {
	unclickedCards = cardArray
	cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 29, 30, 31, 32
	]
	clickedGainCards = [] 
	clickedLossCards = [] 
	numLossCards = 1
	// In cents
	gainAmt = 10
	lossAmt = 1000

	shuffledCardArray = jsPsych.randomization.repeat(cardArray, 1)
	whichLossCards = [] //this determines which are loss cards at the beginning of each round
	for (i = 0; i < numLossCards; i++) {
		whichLossCards.push(shuffledCardArray.pop())
	}
	whichGainCards = shuffledCardArray
	gameState = practiceSetup
	return gameState
}

var getPractice2 = function() {
	unclickedCards = cardArray
	cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 29, 30, 31, 32
	]
	clickedGainCards = [] //num
	clickedLossCards = [] //num
	numLossCards = 1
	gainAmt = 10
	lossAmt = 1000

	shuffledCardArray = jsPsych.randomization.repeat(cardArray, 1)
	whichLossCards = [] //this determines which are loss cards at the beginning of each round
	for (i = 0; i < numLossCards; i++) {
		whichLossCards.push(shuffledCardArray.pop())
	}
	whichGainCards = shuffledCardArray
	gameState = practiceSetup2
	return gameState
}

/*Functions below are for instruction
*/
var instructCard = function(clicked_id) {
	currID = parseInt(clicked_id)
	document.getElementById("NoCardButton").disabled = true;
	document.getElementById("turnButton").disabled = false;
	appendTextAfter(gameState, 'turnButton', ' onclick = turnCards()')
	if (whichLossCards.indexOf(currID) == -1) {
		instructPoints = instructPoints + gainAmt
		document.getElementById('current_round').innerHTML = 'Temporary Account: ' + formatAmount(instructPoints);
		document.getElementById("global_account").innerHTML = 'Global Account: ' + formatAmount(totalEpisodePoints)
		document.getElementById(clicked_id).disabled = true;

		document.getElementById(clicked_id).src =
			'images/final_coin.png';
	} else if (whichLossCards.indexOf(currID) != -1) {
		instructPoints = instructPoints - lossAmt
		document.getElementById(clicked_id).disabled = true;
		document.getElementById('current_round').innerHTML = 'Temporary Account: ' + formatAmount(instructPoints);
		document.getElementById("global_account").innerHTML = 'Global Account: ' + formatAmount(totalEpisodePoints)
		document.getElementById(clicked_id).src =
			'images/final_lion.png';
		 $("input.card_image").attr("disabled", true);
		CCT_timeouts.push(setTimeout(function() {turnCards()}, 10))
	}
}

var instructFunction = function() {
	$('#instructButton').prop('disabled', true)
	$('#jspsych-instructions-next').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})

	$('#jspsych-instructions-back').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})

	var cards_to_turn = [1, 17, 18, 15, 27, 31, 8]
	var total_points = 0
	var points_per_card = 10
	var delay = 0
	for (var i = 0; i < cards_to_turn.length; i++) {
		var card_i = cards_to_turn[i]
		// delay += 250
		total_points += points_per_card
		totalEpisodePoints = total_points
		doSetTimeout(card_i, delay, total_points, totalEpisodePoints, 'win')
	}
	CCT_timeouts.push(setTimeout(function() {
		document.getElementById("instruct1").innerHTML =
		'<strong>Example 1: </strong>In the example below, you see 32 unknown cards. The display shows you that 1 of these cards is a loss card. It also tells you that turning over each gain card is worth 10 points to you, and that turning over the loss card will cost you 750 points. Let us suppose you decided to turn over 7 cards and then decided to stop. Please click the "See Result" button to see what happens: <font color = "red">Luckily, none of the seven cards you turned over happened to be the loss card, so your score for this round was 70. Please click the next button.</font>'
		}, delay))
}

var instructFunction2 = function() {
	$('#instructButton').prop('disabled', true)
	var tempArray = [3, 5, 6, 7, 9, 10, 11, 12, 19, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26,
		27, 28, 29, 31, 32
	]
	var instructTurnCards = function() {
		document.getElementById("8").src = 'images/final_lion.png';
		document.getElementById("2").src = 'images/final_lion.png';

		for (i = 0; i < tempArray.length; i++) {
			document.getElementById("" + tempArray[i] + "").src =
				'images/final_coin.png';
		}
	}

	$('#jspsych-instructions-next').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})

	$('#jspsych-instructions-back').click(function() {
		for (var i = 0; i < CCT_timeouts.length; i++) {
			clearTimeout(CCT_timeouts[i]);
		}
	})
	var cards_to_turn = [1, 4, 30]
	var total_points = 0
	var points_per_card = 30
	var delay = 0
	for (var i = 0; i < cards_to_turn.length; i++) {
		var card_i = cards_to_turn[i]
		// delay += 250
		total_points += points_per_card
		totalEpisodePoints = total_points
		doSetTimeout(card_i, delay, total_points, totalEpisodePoints, 'win')
	}
	// delay += 250
	total_points -= 250
	totalEpisodePoints = total_points
	console.log("Inside instructFunction2")
	console.log(roundPointsArray)
	doSetTimeout(13, delay, total_points, totalEpisodePoints, 'loss')
	CCT_timeouts.push(setTimeout(function() {
		document.getElementById("instruct2").innerHTML =
			'<strong>Example 2: </strong>In the example below, you see 32 unknown cards. The display shows you that 3 of these cards are loss cards. It also tells you that turning over each gain card is worth 30 points to you, and that turning over the loss card will cost you 250 points. Let us suppose you decided to turn over 10 cards and then decided to stop. Please click the "See Result" button to see what happens: <font color = "red">This time, the fourth card you turned over was a loss card. As you saw, the round will immediately end when you turn over the loss card. You had earned 90 points for the 3 gain cards, and then 250 points were subtracted for the loss card, so your score for this round was -160. After the loss points were subtracted from your Round Total, the computer also showed you the cards that you had not yet turned over. Please click the next button.</font>'
	}, delay))
	CCT_timeouts.push(setTimeout(instructTurnCards, 10))
}

var instructButton = function(clicked_id) {
	currID = parseInt(clicked_id)
	document.getElementById(clicked_id).src =
		'images/final_coin.png';
}

/* ************************************ */
/* Experimental Variables               */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true
var performance_var = 0

// task specific variables
var currID = ""
var numLossCards = ""
var gainAmt = ""
var lossAmt = ""
var CCT_timeouts = []
var numWinRounds =  24
var numLossRounds = 4
var numRounds = 10
var lossRounds = jsPsych.randomization.shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,25,26,27,28]).slice(0,numLossRounds)
var riggedLossCards = []
var lossClicked = false
var whichClickInRound = 0
var lossClickAt = 5
var whichRound = 1
var round_type = lossRounds.indexOf(whichRound)==-1 ? 'rigged_win' : 'rigged_loss'
var roundPoints = 0
var totalPoints = 0
var totalEpisodePoints = 0
var roundOver = 0 //0 at beginning of round, 1 during round, 2 at end of round
var instructPoints = 0
var clickedGainCards = []
var clickedLossCards = []
var roundPointsArray = [] 
var whichGainCards = []
var whichLossCards = []
var prize1 = 0
var prize2 = 0
var prize3 = 0
var friendName = ""
var friendNameFilled = false
var playingFor = "Yourself"

// this params array is organized such that the 0 index = the number of loss cards in round, the 1 index = the gain amount of each happy card, and the 2nd index = the loss amount when you turn over a sad face
var paramsArray = [
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000],
	[1, 10, 1000]
]

var cardArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
	24, 25, 26, 27, 28, 29, 30, 31, 32]
var shuffledCardArray = jsPsych.randomization.repeat(cardArray, 1)
var shuffledParamsArray = jsPsych.randomization.repeat(paramsArray, numWinRounds/8)
for (var i = 0; i < numLossRounds; i++) {
	riggedLossCards.push(Math.floor(Math.random()*10)+2)
	var before = shuffledParamsArray.slice(0,lossRounds[i])
	var after = shuffledParamsArray.slice(lossRounds[i])
	var insert = [paramsArray[Math.floor(Math.random()*8)]]
	shuffledParamsArray = before.concat(insert,after)
}

var gameSetup =
	"<div class = cct-box>"+
	"<div class = titleBigBox>  <h3>Now you're playing for </h3>" + "<div class = titleboxMiddle1><div class = center-text id = game_round>Game Round: </div></div>  <div class = titleboxRight1><div class = center-text id = global_account>Global Account: 0</div></div>   <div class = titleboxRight><div class = center-text id = current_round>Temporary Account: 0</div></div>"+
	"<div class = buttonbox><button type='button' id = NoCardButton class = 'CCT-btn select-button' onclick = noCard()>Skip</button><button type='button' id = turnButton class = 'CCT-btn select-button' onclick = endRound()>Collect and Reveal</button><button type='button' id = collectButton class = 'CCT-btn' disabled>Next Round</button></div></div>"+
	getBoard()

var practiceSetup =
	"<div class = practiceText><div class = block-text2 id = instruct1><strong>Practice 1: </strong> As you click on cards, you can see your Round Total change in the box in the upper right.  If you turn over a few cards and then want to stop and go to the next round, click the <strong>Collect and Reveal</strong> button and then <strong>Next Round</strong>.  If turning over cards seems too risky, you can click the <strong>Skip</strong> button, in which case your score for the round will automatically be zero.  This is a practice round, that looks just like the game you will play.  Please select the number of cards you would turn over, given the number of loss cards and the amounts of the gain and loss cards shown below.</div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox> <div class = titleboxMiddle1><div class = center-text id = game_round>Game Round: 1</div></div>    <div class = titleboxRight1><div class = center-text id = global_account>Global Account: 0</div></div>   <div class = titleboxRight><div class = center-text id = current_round>Temporary Account: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>Skip</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>Collect and Reveal</button><button type='button' class = 'CCT-btn select-button' id = collectButton  onclick = collect() disabled>Next Round</button></div></div>"+
	getBoard(2)

var practiceSetup2 =
	"<div class = practiceText><div class = block-text2 id = instruct2><strong>Practice 2: </strong> The computer will record your points for each round and will show you the total after you finish all " + numRounds + " rounds of the game.  This is the second practice round. Please again turn over as many cards as you would like to, given the number of loss cards and the amounts that you can win or lose if you turn over a gain or loss card, as shown below.</div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox> <div class = titleboxMiddle1><div class = center-text id = game_round>Game Round: 2</div></div>    <div class = titleboxRight1><div class = center-text id = global_account>Global Account: 0</div></div>   <div class = titleboxRight><div class = center-text id = current_round>Temporary Account: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>Skip</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>Collect and Reveal</button><button type='button' class = 'CCT-btn select-button' id = collectButton  onclick = collect() disabled>Next Round</button></div></div>"+
	getBoard(2)


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */

var feedback_instruct_text =
	"Welcome to the experiment. This task will take around 25 minutes. Press <strong>enter</strong> to begin."
var feedback_instruct_block = {
	type: 'poldrack-text',
	cont_key: [13],
	data: {
		trial_id: 'instruction'
	},
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};

var userInfoClick = function () {
  friendName = document.getElementById("friendName").value;
  friendNameFilled = true

  document.getElementById("jspsych-instructions-next").hidden = false;
  // $('#instructButton').prop('disabled', true);

  console.log("friendName: ", friendName)
}

var user_info_block = {
  type: 'poldrack-instructions',
  data: {trial_id: 'user-info'},
  pages: [
		'<div class = centerbox><p class = block-text><strong>Getting to know each other</strong>' +
		'<p>You have any friends?</p>' +
	  '<p>Nicee, give us a name of a close friend of yours</p>' +
	  "<form'><div><input type='text' id='friendName' name='friendName'>" +
	  "<button class='CCT-btn select-button' onclick='userInfoClick()'>Submit</button>" +
		'</div></form>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {trial_id: 'instruction'},
  pages: [
		'<div class = centerbox><p class = block-text><strong>Introduction and Explanation</strong>'+
		'<p>-You are now going to participate in a card game.  In this game, you will turn over cards to win or lose points which are worth money.</p>'+
		'<p>-In each game round, you will see 32 cards on the computer screen, face down. You will decide how many of these cards to turn over. Each card is either a gain card or a loss card (there are no neutral cards). You will know how many gain cards and loss cards are in the deck of 32, and how many points you will gain or lose if you turn over a gain or loss card. What you do not know is which of the 32 cards that you see face-down are gain cards and which are loss cards. </p>'+
		'<p>-You indicate which cards you want to flip over by clicking on them. For each gain card turned over, points are added to your round total. You continue turning over cards until a loss card is uncovered or you decide to stop. The first time a loss card is turned over, the loss points will be subtracted from your current point total and the round is over. The accumulated total will be your number of points for that round, and you go on to the next round. Each new round starts with a score of 0 points; that means you play each round independently of the other rounds.</p>'+
		'<p>-You will play a total of ' + numRounds + ' rounds, three of which will be randomly selected at the end of the session, and you will get a bonus payment proportional to those rounds.</p>',
		
	    '<div class = centerbox><p class = block-text><strong>Unknown Cards:</strong>'+
	    '<p> This is what unknown cards looks like.  Turn it over by clicking on it.</p>'+
	    "<p><input type='image' id = '133' src='images/final_closed.png' style='width:110px' onclick = instructButton(this.id)>"+
		'</p></div>',
		
		// ------
		'<div class = centerbox><p class = block-text>'+
		'<p><strong>The Gain Card:</strong></p>'+
		'<p>For every gain card you turn over, your score increases by either 10 or 30 points in different rounds.</p>'+
		"<p><input type='image' src='images/final_coin.png' style='width:110px'>"+
		'<p><strong>The Loss Card:</strong></p>'+
		"<p><input type='image' src='images/final_lion.png' style='width:110px'></p>"+
		'<p>For every loss card you turn over, your score decreases by either 250 or 750 points in different rounds. Furthermore, the round immediately ends (you cannot turn over any more cards). There will be either 1 or 3 loss cards in any given round.</p>'+
		'<p>The number of loss cards and the value of points that can be won or lost by turning over a gain or loss card are fixed in each round. This information will always be on display so you know what kind of round you are in.</p>'+
		'</p></div>',
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

// timeline: [feedback_instruct_block, user_info_block, instructions_block],
// || friendName != "" || friendName != null
// console.log("-- We got the friend name and hence leaving")
var instruction_node = {
	timeline: [feedback_instruct_block, user_info_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		$('#jspsych-instructions-next').click(function() {
			// overriding functionality
			console.log("inside overriden button")
			friendName = document.getElementById("friendName").value;
		  friendNameFilled = true

		  console.log("friendName: ", friendName)
		})
		// if (friendNameFilled == true){
		// 	console.log("friendNameFilled: ", friendNameFilled)
		// 	console.log("friendName: ", friendName)
		// 	feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
		// 	return false
		// }
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}


var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'end',
		exp_id: 'columbia_card_task_hot'
	},
	text: '<div class = centerbox><p class = center-block-text>Finished with this task.</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
  	on_finish: assessPerformance
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'test_intro'
	},
	text: '<div class = centerbox><p class = center-block-text>We will now start the test. Press <strong>enter</strong> to begin.</p></div>',
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: function(){
		whichClickInRound = 0
		whichLossCards = [riggedLossCards.shift()]
	}
};


var practice_block1 = {
	type: 'single-stim-button',
	button_class: 'select-button',
	stimulus: getPractice1,
	is_html: true,
	data: {
		trial_id: 'stim',
		exp_stage: 'practice'
	},
	timing_post_trial: 0,
	response_ends_trial: true,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			num_loss_cards: numLossCards,
			gain_amount: gainAmt,
			loss_amount: lossAmt,
			instruct_points: instructPoints,
		})
		instructPoints = 0
	}
};

var practice_block2 = {
	type: 'single-stim-button',
	button_class: 'select-button',
	stimulus: getPractice2,
	is_html: true,
	data: {
		trial_id: 'stim',
		exp_stage: 'practice'
	},
	timing_post_trial: 0,
	response_ends_trial: true,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({
			num_loss_cards: numLossCards,
			gain_amount: gainAmt,
			loss_amount: lossAmt,
			instruct_points: instructPoints,
		})
		instructPoints = 0
	}
};

var test_block = {
	type: 'single-stim-button',
	button_class: 'select-button',
	stimulus: getRound,
	is_html: true,
	data: {
		trial_id: 'stim',
		exp_stage: 'test'
	},
	timing_post_trial: 0,
	on_finish: appendTestData,
	response_ends_trial: true,
};

var test_node = {
	timeline: [test_block],
	loop_function: function(data) {
		if (currID == 'collectButton') {
			// Tarek: Apparently here is where we reset variables for a round
			roundPointsArray.push(roundPoints)
			totalEpisodePoints += roundPoints
			roundOver = 0
			roundPoints = 0
			whichClickInRound = 0
			whichRound = whichRound + 1
			lossClickAt = getRandomInt(2, 32) 
			round_type = lossRounds.indexOf(whichRound)==-1 ? 'rigged_win' : 'rigged_loss'
			if (round_type == 'rigged_loss') {
				whichLossCards = [riggedLossCards.shift()]
			}

			if (whichRound > 1 && whichRound % 10 == 1){
				console.log("== playingFor ", playingFor)
				if (playingFor == 'Yourself'){
					playingFor = friendName
				} else {
					playingFor = 'Some Stranger'
				}
			}

			lossClicked = false
			return false
		} else {
			return true
		}
	}
}


var payout_text = {
	type: 'poldrack-text',
	text: episodeEndText,
	data: {
		trial_id: 'reward'
	},
	cont_key: [13],
	timing_post_trial: 1000,
	on_finish: appendPayoutData,
};

var payoutTrial = {
	type: 'call-function',
	data: {
		trial_id: 'calculate reward'
	},
	func: function() {
		totalPoints = math.sum(roundPointsArray)
		randomRoundPointsArray = jsPsych.randomization.repeat(roundPointsArray, 1)
		prize1 = randomRoundPointsArray.pop()
		prize2 = randomRoundPointsArray.pop()
		prize3 = randomRoundPointsArray.pop()
		performance_var = prize1 + prize2 + prize3
	}
};

/* create experiment definition array */
var columbia_card_task_hot_experiment = [];

columbia_card_task_hot_experiment.push(instruction_node);
columbia_card_task_hot_experiment.push(practice_block1);
columbia_card_task_hot_experiment.push(practice_block2);

columbia_card_task_hot_experiment.push(start_test_block);


// Tarek: Structure is here
// First episode
for (i = 0; i < numRounds; i++) {
	columbia_card_task_hot_experiment.push(test_node);
}

columbia_card_task_hot_experiment.push(payoutTrial);
columbia_card_task_hot_experiment.push(payout_text);

// Second Episode
for (i = 0; i < numRounds; i++) {
	columbia_card_task_hot_experiment.push(test_node);
}

columbia_card_task_hot_experiment.push(payoutTrial);
columbia_card_task_hot_experiment.push(payout_text);

// Third Episode
for (i = 0; i < numRounds; i++) {
	columbia_card_task_hot_experiment.push(test_node);
}

columbia_card_task_hot_experiment.push(payoutTrial);
columbia_card_task_hot_experiment.push(payout_text);
columbia_card_task_hot_experiment.push(post_task_block);

columbia_card_task_hot_experiment.push(end_block);
