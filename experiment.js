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

var playingForText = function() {
	return '<div class = centerbox><p class = block-text>Sie spielen die folgenden Runden für <strong>' + playingFor + '</strong>' +
		'</p><small class = block-text>Drücken Sie <strong>Enter</strong>, um fortzufahren.</small></div>'
}

var episodeEndText = function() {
	return '<div class = centerbox><h3>Spielzusammenfassung</h3>' +
		'<p class = block-text>Sie haben ' + formatAmount(selfTotalPoints) + ' für sich selbst gewonnen.</p>' +
		'<p class = block-text>Sie haben ' + formatAmount(closeFriendTotalPoints) + ' für ' + friendName + ' gewonnen. </p>' +
		'<p class = block-text>Sie haben ' + formatAmount(distantFriendTotalPoints) + ' für eine fremde Person gewonnen. </p>' +
		'</p><p class = block-text>Drücken Sie <strong>Enter</strong>, um fortzufahren.</p></div>'
}

var appendPayoutData = function(){
	jsPsych.data.addDataToLastTrial({
		rewards: {
			selfTotalPoints: selfTotalPoints,
			closeFriendTotalPoints: closeFriendTotalPoints,
			distantFriendTotalPoints: distantFriendTotalPoints
		},
		episodesOrder: episodesOrder,
		friendName: friendName
	})
}

var appendTestData = function() {
	jsPsych.data.addDataToLastTrial({
		which_round: whichRound,
		num_click_in_round: whichClickInRound,
		which_episode: whichEpisode,
		lion_to_appear_at: lossClickAt,
	})
}

// var whichEpisode = function() {
// 	var roundType = "self"
// 	if (playingFor != 'sich selbst'){
// 		if (playingFor == friendName) {
// 			roundType = "friend"
// 		} else {
// 			roundType = "stranger"
// 		}
// 	}

// 	return roundType
// }

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
	console.log("\n--END ROUND METHOD")
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
		clickedLossCards.push(currID)
		index = unclickedCards.indexOf(currID, 0)
		unclickedCards.splice(index, 1)
		roundPoints = 0
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
	return amount + " Bonuspunkte"
}

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var getRound = function() {
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
	

		gameState = appendTextAfter(gameState, 'Runden für ', playingFor)
		// gameState = appendTextAfter(gameState, 'Game Round: ', whichRound)
		gameState = appendTextAfter2(gameState, 'Konto: ', formatAmount(roundPoints), '0')
		// gameState = appendTextAfter2(gameState, 'Global Account: ', formatAmount(totalEpisodePoints), '0')
		// gameState = appendTextAfter(gameState, 'Number of Loss Cards: ', numLossCards)
		gameState = appendTextAfter(gameState, 'Gain Amount: ', formatAmount(gainAmt))
		// gameState = appendTextAfter(gameState, "endRound()", " disabled")
		roundOver = 1
		return gameState
	} else if (roundOver == 1) { //this is for during the round
		gameState = appendTextAfter(gameState, 'Runden für ', playingFor)
		// gameState = appendTextAfter(gameState, 'Game Round: ', whichRound)
		gameState = appendTextAfter2(gameState, 'Konto: ', formatAmount(roundPoints), '0')
		// gameState = appendTextAfter2(gameState, 'Global Account: ', formatAmount(totalEpisodePoints), '0')
		// gameState = appendTextAfter(gameState, 'Number of Loss Cards: ', numLossCards)
		gameState = appendTextAfter(gameState, 'Gain Amount: ', formatAmount(gainAmt))
		// gameState = appendTextAfter(gameState, "noCard()", " disabled")
		// gameState = appendTextAfter2(gameState, "class = 'CCT-btn "," ' disabled", "select-button' onclick = noCard()")
		for (i = 0; i < clickedGainCards.length; i++) {
			gameState = appendTextAfter2(gameState, "id = " + "" + clickedGainCards[i] + ""," class = 'card_image' src='images/final_coin.png' style='width:70px; height:70px;'", " class = 'card_image select-button' src='images/final_closed.png' style='width:70px; height:70px;' onclick = chooseCard(this.id)")
		}
		return gameState
	} else if (roundOver == 2) { //this is for end the round
		roundOver = 3
		gameState = appendTextAfter(gameState, 'Runden für ', playingFor)
		// gameState = appendTextAfter(gameState, 'Game Round: ', whichRound)
		gameState = appendTextAfter2(gameState, 'Konto: ', formatAmount(roundPoints), '0')
		// gameState = appendTextAfter2(gameState, 'Global Account: ', formatAmount(totalEpisodePoints), '0')
		// gameState = appendTextAfter(gameState, 'Number of Loss Cards: ', numLossCards)
		gameState = appendTextAfter(gameState, 'Gain Amount: ', formatAmount(gainAmt))
		gameState = appendTextAfter2(gameState, "id = collectButton class = 'CCT-btn", " select-button' onclick = collect()", "'")
		gameState = appendTextAfter(gameState, "endRound()", " disabled")
		// gameState = appendTextAfter(gameState, "noCard()", " disabled")
		
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
		document.getElementById("current_round").innerHTML = 'Konto: ' + points
		// document.getElementById("global_account").innerHTML = 'Global Account: ' + totalEpisodePoints
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
	gainAmt = 1

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
	gainAmt = 1


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
		document.getElementById('current_round').innerHTML = 'Konto: ' + formatAmount(instructPoints);
		// document.getElementById("global_account").innerHTML = 'Global Account: ' + formatAmount(totalEpisodePoints)
		document.getElementById(clicked_id).disabled = true;

		document.getElementById(clicked_id).src =
			'images/final_coin.png';
	} else if (whichLossCards.indexOf(currID) != -1) {
		instructPoints = 0
		document.getElementById(clicked_id).disabled = true;
		document.getElementById('current_round').innerHTML = 'Konto: ' + formatAmount(instructPoints);
		// document.getElementById("global_account").innerHTML = 'Global Account: ' + formatAmount(totalEpisodePoints)
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
	var points_per_card = 1
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
		'<strong>Example 1: </strong>In the example below, you see 32 unknown cards. The display shows you that 1 of these cards is a loss card. It also tells you that turning over each gain card is worth 1 point to you, and that turning over the loss card will cost you 750 points. Let us suppose you decided to turn over 7 cards and then decided to stop. Please click the "See Result" button to see what happens: <font color = "red">Luckily, none of the seven cards you turned over happened to be the loss card, so your score for this round was 70. Please click the next button.</font>'
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
var CCT_timeouts = []
var numWinRounds =  24
var numLossRounds = 4
var numRounds = 10
var lossRounds = jsPsych.randomization.shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,25,26,27,28]).slice(0,numLossRounds)
var riggedLossCards = []
var lossClicked = false
var whichClickInRound = 0
var lossClickAt = getRandomInt(2, 32)
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

// Variables for different episode
// TODO change
// var episodesOrder = jsPsych.randomization.shuffle(["self", "friend", "stranger"])
var episodesOrder = ["friend", "stranger", "self"]
var whichEpisode = episodesOrder[0]
console.log("- Initial episodesOrder: ", episodesOrder)
console.log("- Initial whichEpisode: ", whichEpisode)

var friendName = ""
var friendNameFilled = false


var playingFor = "sich selbst"
if (whichEpisode == "stranger"){
	playingFor = 'eine fremde Person'
}

var selfTotalPoints = 0
var closeFriendTotalPoints = 0
var distantFriendTotalPoints = 0


// this params array is organized such that the 0 index = the number of loss cards in round, the 1 index = the gain amount of each happy card, and the 2nd index = the loss amount when you turn over a sad face
var paramsArray = [
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000],
	[1, 1, 1000]
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
	"<div class = titleBigBox>  <h3>Sie spielen die folgenden Runden für  </h3>" + "<div class = titleboxMiddle1><div class = center-text id = current_round>Konto: 0</div></div>"+
	"<div class = buttonbox3><button type='button' id = turnButton class = 'CCT-btn select-button' onclick = endRound()>Punkte sammeln</button><button type='button' id = collectButton class = 'CCT-btn' disabled>nächste Runde</button></div></div>"+
	getBoard()

var practiceSetup =
	"<div class = practiceText><div class = block-text2 id = instruct1><strong>Übungsrunde: </strong> Im folgenden Beispiel sehen Sie die 32 geschlossene Boxen. Hinter einer dieser Boxen befindet sich der Löwe, hinter den restlichen Boxen sind Goldtaler versteckt. Dies ist eine Übungsrunde, die genauso aussieht wie das Spiel, das Sie spielen werden. Bitte öffnen Sie mit einem Mausklick so viele Boxen, wie Sie möchten. Wenn Sie aufhören und Ihre Gewinne in dieser Runde sichern möchten, klicken Sie auf die Schaltfläche 'Punkte sammeln'. Sobald der Löwe erscheint, verlieren Sie sämtliche Gewinne dieser Runde.</div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox>   <div class = titleboxMiddle1><div class = center-text id = current_round>Konto: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>Skip</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>Punkte sammeln</button><button type='button' class = 'CCT-btn select-button' id = collectButton  onclick = collect() disabled>nächste Runde</button></div></div>"+
	getBoard(2)

var practiceSetup2 =
	"<div class = practiceText><div class = block-text2 id = instruct2><strong>Practice 2: </strong> The computer will record your points for each round and will show you the total after you finish all " + numRounds + " rounds of the game.  This is the second practice round. Please again turn over as many cards as you would like to, given the number of loss cards and the amounts that you can win or lose if you turn over a gain or loss card, as shown below.</div></div>"+
	"<div class = cct-box2>"+
	"<div class = titleBigBox>   <div class = titleboxMiddle1><div class = center-text id = current_round>Konto: 0</div></div>"+
	"<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>Skip</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>Punkte sammeln</button><button type='button' class = 'CCT-btn select-button' id = collectButton  onclick = collect() disabled>nächste Runde</button></div></div>"+
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

var manipulation_check_self = {
   type: 'survey-text',
   data: {
       trial_id: "manipulation_check_self"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Für wen haben Sie das vorherige Spiel gespielt?</p>'],
   rows: [2],
   columns: [20]
};

var manipulation_check_friend = {
   type: 'survey-text',
   data: {
       trial_id: "manipulation_check_friend"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Für wen haben Sie das vorherige Spiel gespielt?</p>'],
   rows: [2],
   columns: [20]
};

var manipulation_check_stranger = {
   type: 'survey-text',
   data: {
       trial_id: "manipulation_check_stranger"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Für wen haben Sie das vorherige Spiel gespielt?</p>'],
   rows: [2],
   columns: [20]
};

/* define static blocks */

var feedback_instruct_text =
	"Willkommen zu diesem Experiment. Diese Aufgabe wird etwa 25 Minuten dauern. Drücken Sie die <strong>Eingabetaste</strong>, um zu beginnen"
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
  friendName = document.getElementById("friendNameValue").value;
  friendNameFilled = true
  playingFor = friendName

  document.getElementById("jspsych-instructions-next").disabled = false;
  document.getElementById("userInfoForm").hidden = true;
  document.getElementById("friendName").innerHTML = friendName
  // $('#instructButton').prop('disabled', true);

  console.log("friendName: ", friendName)
}

var close_friend_block = {
	type: 'poldrack-instructions',
  data: {trial_id: 'user-info', disable_instruction_button: true},
  pages: [
  	// - Close friend
		'<div class = centerbox><p class = block-text><strong>Enger Freund oder Freundin</strong>' +
		'<p>In den folgenden Runden spielen Sie für einen engen Freund/eine enge Freundin.</p>' +
	  '<p>Bitte schauen Sie sich die folgenden Bilder an. Die Beziehungen zwischen zwei Personen werden durch die dargestellten Kreise ausgedrückt. Bitte schreiben Sie den Vornamen eines engen Freundes oder Freundin auf, mit der Sie die durch 7 gekennzeichnete Beziehung haben.</p>' +
	  '<img src="images/close_friend.png" alt="Freund (8)" width="500">' +
	  '<p>Vorname der Person:</p>' +
	  "<p id='friendName'></p>" +
	  "<form'><div id='userInfoForm'><input type='text' id='friendNameValue' name='friendName'>" +
	  "<button class='CCT-btn select-button' onclick='userInfoClick()'>Submit</button>" +
		'</div></form>'
  ],
  allow_keys: false,
  button_label_next: "Weiter",
  button_label_previous: "Zurück",
  show_clickable_nav: true,
  timing_post_trial: 1000
}

var distant_friend_block = {
	type: 'poldrack-instructions',
  data: {trial_id: 'user-info', disable_instruction_button: false},
  pages: [
		// - Distant friend
		'<div class = centerbox><p class = block-text><strong>Fremde Person</strong>' +
		'<p>In den folgenden Runden spielen Sie für eine fremde (Ihnen nicht bekannte) Person. Alle Gewinne in den folgenden Runden werden für diese Person erspielt.</p>' +
	  '<p>Bitte schauen Sie sich die folgenden Bilder an. Die Beziehungen zwischen zwei Personen werden durch die dargestellten Kreise ausgedrückt. Mit der fremden Person haben Sie die durch 1 gekennzeichnete Beziehung. </p>' +
	  '<img src="images/strange_friend.png" alt="Nich so freunde (1)" width="500">'
  ],
  allow_keys: false,
  button_label_next: "Weiter",
  button_label_previous: "Zurück",
  show_clickable_nav: true,
  timing_post_trial: 1000
}

// var user_info_block = {
//   type: 'poldrack-instructions',
//   data: {trial_id: 'user-info'},
//   pages: [
//   	// - Close friend
// 		'<div class = centerbox><p class = block-text><strong>Enger Freund oder Freundin</strong>' +
// 		'<p>In den folgenden Runden werden Sie für einen engen Freund/eine enge Freundin spielen. </p>' +
// 	  '<p>Bitte schauen Sie sich die folgenden Bilder an. Die Beziehungen zwischen zwei Personen werden durch die dargestellten Kreise ausgedrückt. Bitte schreiben Sie den Namen eines engen Freundes oder Freundin auf, mit der Sie die durch 7 gekennzeichnete Beziehung haben.</p>' +
// 	  '<img src="images/close_friend.png" alt="Freund (8)" width="500">' +
// 	  '<p>Vorname der Person:</p>'
// 	  "<form'><div><input type='text' id='friendName' name='friendName'>" +
// 	  "<button class='CCT-btn select-button' onclick='userInfoClick()'>Submit</button>" +
// 		'</div></form>',

// 		// - Distant friend
// 		'<div class = centerbox><p class = block-text><strong>Fremde Person</strong>' +
// 		'<p>In den folgenden Runden werden Sie für eine fremde Person spielen.</p>' +
// 	  '<p>Bitte schauen Sie sich die folgenden Bilder an. Mit der fremden Person, haben Sie die durch die Kreise symbolisierte Beziehung (mit 1 gekennzeichnet)</p>' +
// 	  '<img src="images/strange_friend.png" alt="Nich so freunde (1)" width="500">'
//   ],
//   allow_keys: false,
//   button_label_next: "Weiter",
//   button_label_previous: "Zurück",
//   show_clickable_nav: true,
//   timing_post_trial: 1000
// };

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {trial_id: 'instruction'},
  pages: [
		'<div class = centerbox><p class = block-text><strong>Anleitung</strong>'+
		'<p>Im Folgenden präsentieren wir Ihnen 32 geschlossene Boxen. Hinter 31 Boxen ist jeweils 1 Goldtaler versteckt. Hinter einer Box verbirgt sich ein Löwe. Jede der Boxen kann durch einen Mausklick geöffnet werden. Sie können in beliebiger Reihenfolge so viele Boxen öffnen, wie Sie möchten. Sie können jederzeit aufhören zu spielen, um Ihre Gewinne in dieser Runde zu sichern. Dafür müssen Sie auf die Schaltfläche "Punkte sammeln" klicken.</p>' +
		'<p>Hinter einer Box befindet sich allerdings ein Löwe. Sobald der Löwe erscheint, verlieren Sie sämtliche Gewinne dieser Runde. Nachdem Sie sich entweder die Gewinne gesichert haben oder der Löwe erschienen ist, beginnt eine neue Runde.</p>'+
		'<p>Hinweis: Je mehr Boxen Sie öffnen, desto höhere Gewinne erzielen Sie. Zugleich erhöht sich mit jedem Öffnen einer weiteren Box auch die Wahrscheinlichkeit, den Löwen „zu erwischen“ und damit sämtliche Gewinne der Runde zu verlieren.</p>',
		
	  '<div class = centerbox><p class = block-text><strong>Geschlossene Box:</strong>'+
	  '<p>So sehen geschlossene Boxen aus. Öffnen Sie die Box, indem Sie sie anklicken.</p>'+
	  "<p><input type='image' id = '133' src='images/final_closed.png' style='width:110px' onclick = instructButton(this.id)>"+
		'</p></div>',
		
		// ------
		'<div class = centerbox><p class = block-text>'+
		'<p><strong>Box mit Goldtaler</strong></p>'+
		'<p>Für jede geöffnete Box, hinter der ein Goldtaler versteckt ist, gewinnen Sie 1 Bonuspunkt.</p>'+
		"<p><input type='image' src='images/final_coin.png' style='width:110px'>"+
		'<p><strong>Box mit Löwe</strong></p>'+
		"<p><input type='image' src='images/final_lion.png' style='width:110px'></p>"+
		'<p>Sobald Sie die Box mit dem Löwen auswählen, verlieren Sie sämtliche Gewinne dieser Runde und eine neue Runde beginnt.</p>'+
		'</p></div>',
  ],
  allow_keys: false,
  button_label_next: "Weiter",
  button_label_previous: "Zurück",
  show_clickable_nav: true,
  timing_post_trial: 1000
};

// timeline: [feedback_instruct_block, user_info_block, instructions_block],
// || friendName != "" || friendName != null
// console.log("-- We got the friend name and hence leaving")
var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		$('#jspsych-instructions-next').click(function() {
			// overriding functionality
			
			friendName = document.getElementById("friendName").value;
		  friendNameFilled = true

		})
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Drücken Sie <strong>Enter</strong>, um fortzufahren.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Drücken Sie <strong>Enter</strong>, um fortzufahren.'
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
	text: '<div class = centerbox><p class = center-block-text>Sie sind mit dieser Aufgabe fertig.</p><p class = center-block-text>Drücken Sie <strong>Enter</strong>, um fortzufahren.</p></div>',
	cont_key: [13],
	timing_post_trial: 0,
  	on_finish: assessPerformance
};

var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'test_intro'
	},
	text: '<div class = centerbox><p class = center-block-text>Die Aufgabe beginnt nun. Drücken Sie zum Starten die <strong>Eingabetaste</strong>.</p></div>',
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
			instruct_points: instructPoints
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
			// This is when we click next round
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
				whichEpisodeIndx = parseInt(whichRound / 10)
				
				totalPoints = totalEpisodePoints

				// Assigning points for the past episode
				if (whichEpisode == "self"){
					selfTotalPoints = totalEpisodePoints
				} else if (whichEpisode == "friend") {
					closeFriendTotalPoints = totalEpisodePoints
				} else {
					distantFriendTotalPoints = totalEpisodePoints
				}
				whichEpisode = episodesOrder[whichEpisodeIndx]

				// Assigning the playing for when we know who is it
				if (whichEpisode == "self"){
					playingFor = 'sich selbst'
				} else if (whichEpisode == "friend") {
					playingFor = friendName
				} else {
					playingFor = 'eine fremde Person'
				}

				totalEpisodePoints = 0
				console.log("== whichEpisode ", whichEpisode)
				console.log("== playingFor ", playingFor)
				console.log("== selfTotalPoints ", selfTotalPoints)
				console.log("== closeFriendTotalPoints ", closeFriendTotalPoints)
				console.log("== distantFriendTotalPoints ", distantFriendTotalPoints)
			}

			lossClicked = false
			return false
		} else {
			return true
		}
	}
}

var playing_for_text = {
	type: 'poldrack-text',
	text: playingForText,
	cont_key: [13],
	timing_post_trial: 1000
};

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
		// totalPoints = math.sum(roundPointsArray)
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

columbia_card_task_hot_experiment.push(start_test_block);


for (j = 0; j < 3; j++){
	
	if (episodesOrder[j] === "self"){
		columbia_card_task_hot_experiment.push(playing_for_text);
	} else if (episodesOrder[j] === "friend") {
		columbia_card_task_hot_experiment.push(close_friend_block);
		columbia_card_task_hot_experiment.push(playing_for_text);
	} else {
		columbia_card_task_hot_experiment.push(distant_friend_block);
	}


	for (i = 0; i < numRounds; i++) {
		columbia_card_task_hot_experiment.push(test_node);
	}
	columbia_card_task_hot_experiment.push(payoutTrial);

	if (episodesOrder[j] === "self"){
		columbia_card_task_hot_experiment.push(manipulation_check_self);
	} else if (episodesOrder[j] === "friend") {
		columbia_card_task_hot_experiment.push(manipulation_check_friend);
	} else {
		columbia_card_task_hot_experiment.push(manipulation_check_stranger);
	}
}



// // Second Episode
// columbia_card_task_hot_experiment.push(close_friend_block);
// columbia_card_task_hot_experiment.push(playing_for_text);
// for (i = 0; i < numRounds; i++) {
// 	columbia_card_task_hot_experiment.push(test_node);
// }
// columbia_card_task_hot_experiment.push(payoutTrial);


// Third Episode
// columbia_card_task_hot_experiment.push(distant_friend_block);
// columbia_card_task_hot_experiment.push(playing_for_text);
// for (i = 0; i < numRounds; i++) {
// 	columbia_card_task_hot_experiment.push(test_node);
// }
// columbia_card_task_hot_experiment.push(payoutTrial);


// Show final summary
columbia_card_task_hot_experiment.push(payout_text);

// Show feedback page
// columbia_card_task_hot_experiment.push(post_task_block);

columbia_card_task_hot_experiment.push(end_block);

