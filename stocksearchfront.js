$(document).ready(function () {
	//initialize obj
	var obj
// initialize favoriteList table
	genFavoriteTable();
	//initialize go to stock information button
	//$("#next").attr("disabled", true).tooltip({title:"Display Stock Information"});
	//autocomplete
    
	$("#symbol").autocomplete({
		source: function (request, response) {
			$.ajax({
				type: "GET",
				url: "http://stocksearchback.appspot.com/index.php",
				datatype: "json",
				data: {
					input: request.term
				},
				success: function (data) {
					if (data) {
						var dataArr = JSON.parse(data);
						var menuArr = new Array();
						for (var i = 0; i < dataArr.length; i++) {
							menuArr[i] = {
								label: dataArr[i].Symbol + " - " + dataArr[i].Name + " ( " + dataArr[i].Exchange + " )",
								value: dataArr[i].Symbol
							};
						}
						response(menuArr);
					}
				}
			});
		},
		appendTo: "#menu-container"
	});
	//			quote
	$("#quote").click(function () {
		stockDetailCreater($("#symbol").val());
		//		$("#symbol").val($("#symbol").val());
		//		$("#validation").html($("#validation").html());
	});

	$(".linkQuote").click(function () {
		stockDetailCreater($(this).html());
	});

	function stockDetailCreater(symbol) {
		$.ajax({
			type: "GET",
			url: "http://stocksearchback.appspot.com/index.php",
			datatype: "json",
			data: {
				symbol: symbol
			},
			success: function (json) {
				obj = JSON.parse(json);
				if (obj.Status == "SUCCESS"||obj.Status == "Failure|APP_SPECIFIC_ERROR") {
					var stockTable = genStockTable(obj);
					console.log("----------------------Stock Quote API------------------------");
					console.log(json);
					$("#table").html(stockTable);
					//change star button color according localstorage
					if (checkOn(obj.Symbol)) {
						$("#star").css("color", "yellow");
					} else {
						$("#star").css("color", "white");
					}
					//						Yahoo Daily Stock Chart
					console.log("----------------------Yahoo Daily Stock Chart------------------------");
					$("#yahoo").html("<img width=100% src='http://chart.finance.yahoo.com/t?s=" + symbol + "&lang=en-US&width=400&height=300'>")
						//enable go to stock information button
					$("#next").attr("disabled", false).trigger("click");
					$("#validation").hide();
				}
				if (obj.Message) {
					if ($("#symbol").val()) {
						$("#validation").show();
					}
				}
			},
			error: function (e) {
				console.log(e);
				if ($("#symbol").val()) {
					$("#validation").show();
				}
			}
		});

		$.ajax({
			type: "GET",
			url: "http://stocksearchback.appspot.com/index.php",
			datatype: "json",
			data: {
				parameters: JSON.stringify(getInputParams(symbol))
			},
			success: function (json) {
				try {
					var obj = JSON.parse(json);
					console.log("----------------------Interactive Chart API------------------------");
					//console.log(json);
					render(json, symbol);
					$("#validation").hide();
				} catch (e) {
					console.log(e);
					if ($("#symbol").val()) {
						$("#validation").show();
					}
				}
			},
			error: function (e) {
				console.log(e);
				if ($("#symbol").val()) {
					$("#validation").show();
				}
			}
		});

		$.ajax({
			type: "GET",
			url: "http://stocksearchback.appspot.com/index.php",
			datatype: "json",
			data: {
				query: symbol
			},
			success: function (json) {
				var obj = JSON.parse(json);
				console.log("----------------------Bing Search API------------------------");
				//console.log(json);
				var news = genNews(json, $("#symbol").val());
				//console.log(news);
				$(".newsContainer").html(news);
			},
			error: function (e) {
				console.log(e);
			}
		});
	}

	function genNews(json, symbol) {
		var object = JSON.parse(json);
		var news = "";
		var results = object.d.results;
		//console.log(results);
		for (var i = 0; i < results.length; i++) {
			news += "<div class='well news'>";
			news += "<p><a href='" + results[i].Url + "'>" + results[i].Title + "</p></a>";
			news += "<p>" + results[i].Description.replace(eval("/" + symbol.toUpperCase() + "/g"), "<b>" + symbol.toUpperCase() + "</b>") + "</P><br>";
			news += "<p><b>Publisher: " + results[i].Source + "</b></p>";
			news += "<p><b>Date: " + moment(results[i].Date).format('DD MMMM YYYY hh:mm:ss')+ "</b></p>";
			news += "</div>";
		}
		return news;
	}
	//  facebook initiation
	window.fbAsyncInit = function () {
		FB.init({
			appId: '925243917601275',
			cookie: true, // enable cookies to allow the server to access 
			// the session
			xfbml: true, // parse social plugins on this page
			version: 'v2.5' // use graph api version 2.5
		});
	};

	// Load the SDK asynchronously
	(function (d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s);
		js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	// Facebook share
	$('#facebook').on('click', function () {
		console.log("fb clicked");
		var name = "Current Stock Price of " + obj.Name + " is $" + obj.LastPrice.toFixed(2);
		var description = "Stock Information of " + obj.Name + " (" + obj.Symbol + ")";
		var caption = "LAST TRADE PRICE:$ " + obj.LastPrice.toFixed(2) + ", CHANGE: " + obj.Change.toFixed(2) + "(" + obj.ChangePercent.toFixed(2) + "%)";
		FB.ui({
				method: 'feed',
				picture: 'http://chart.finance.yahoo.com/t?s=a&lang=en-US&width=350&height=350',
				name: name,
				link: 'http://www-scf.usc.edu/~jiayilai/HW8/stocksearchfront.html',
				description: description,
				caption: caption,
			},
			function (response) {
				if (response && !response.error_message) {
					alert('Posted Successfully.');
				} else {
					alert('Not Posted.');
				}
			}
		);
	});

	//Given a symbol, check whether the stock is favorite one, returning false if not or number in the localstorage array if true
	function checkOn(symbol) {
		if (!localStorage.getItem("symbols")) {
			//initialize symbols localstorage
			var empty = [];
			localStorage.setItem("symbols", JSON.stringify(empty));
			return false;
		}
		var symbols = JSON.parse(localStorage.getItem("symbols"));
		for (var i = 0; i < symbols.length; i++) {
			if (symbol == symbols[i].symbol) {
				return i + 1;
			}
		}
		return false;
	}

	//clicking star button function
	$("#star").on("click", function () {
		on = checkOn(obj.Symbol);
		if (!on) {
			$(this).css("color", "yellow");
			var symbol = {
				symbol: obj.Symbol
			};
			var symbols = JSON.parse(localStorage.getItem("symbols"));
			symbols.push(symbol);
			localStorage.setItem("symbols", JSON.stringify(symbols));
		} else {
			$(this).css("color", "white");
			var symbols = JSON.parse(localStorage.getItem("symbols"));
			symbols.splice(on - 1, 1);
			localStorage.setItem("symbols", JSON.stringify(symbols));
		}
		genFavoriteTable();
	});

	function genStockTable(obj) {
		var stockTable = "";
		stockTable += "<table width='100%'>";
		stockTable += "<tr><th>Name</th>";
		stockTable += "<td>" + obj.Name + "</td></tr>";
		stockTable += "<tr><th>Symbol</th>";
		stockTable += "<td>" + (symbol = obj.Symbol) + "</td></tr>";
		stockTable += "<tr><th>Last Price</th>";
		stockTable += "<td>" + "$ " + (obj.LastPrice).toFixed(2) + "</td></tr>";
		stockTable += "<tr><th>Change (Change Percent)</th>";
		stockTable += upOrDown(obj.Change, obj.ChangePercent) + "</tr>";
		stockTable += "<tr><th>Time and Date</th>";
		stockTable += "<td>" + moment(obj.Timestamp).format('DD MMMM YYYY, hh:mm:ss a') + "</td></tr>";
		stockTable += "<tr><th>Market Cap</th>";
		stockTable += "<td>" + capCal(obj.MarketCap) + "</td></tr>";
		stockTable += "<tr><th>Volume</th>";
		stockTable += "<td>" + obj.Volume + "</td></tr>";
		stockTable += "<tr><th>Change YTD (Change Percent YTD)</th>";
		stockTable += upOrDown(obj.ChangeYTD, obj.ChangePercentYTD) + "</tr>";
		stockTable += "<tr><th>High Price</th>";
		stockTable += "<td>" + "$ " + (obj.High).toFixed(2) + "</td></tr>";
		stockTable += "<tr><th>Low Price</th>";
		stockTable += "<td>" + "$ " + (obj.Low).toFixed(2) + "</td></tr>";
		stockTable += "<tr><th>Opening Price</th>";
		stockTable += "<td>" + "$ " + (obj.Open).toFixed(2) + "</td></tr>";
		stockTable += "</table>";
		return stockTable;
	}

	function upOrDown(change, changePercent) {
		if (changePercent < 0) {
			return "<td style='color:red;'>" + change.toFixed(2) + " ( " + changePercent.toFixed(2) + "% )" + "<img src='http://cs-server.usc.edu:45678/hw/hw8/images/down.png'>" + "</td>";
		} else if (changePercent > 0) {
			return "<td style='color:green;'>" + change.toFixed(2) + " ( " + changePercent.toFixed(2) + "% )" + "<img src='http://cs-server.usc.edu:45678/hw/hw8/images/up.png'>" + "</td>";
		} else {
			return "<td>" + change.toFixed(2) + "(" + changePercent.toFixed(2) + "%)" + "</td>";
		}
	}

	function capCal(number) {
		var b = number / 1000000000
		if (b >= 1) {
			return b.toFixed(2) + " Billion";
		}
		var m = number / 1000000;
		if (m >= 1) {
			return m.toFixed(2) + " Million";
		}
		return number;
	}

	//render chart using received json
	function render(json, symbol) {
		ohlc = getOHLC(json);
		globalSymbol = symbol;
		var groupingUnits = [['week', [1]], ['month', [1, 3, 6]]];
		// create the chart
		$('#chartContainer').highcharts('StockChart', {

			rangeSelector: {
				selected: 0,
				inputEnabled: false,
				buttons: [{
						type: 'week',
						count: 1,
						text: '1w'
},
					{
						type: 'month',
						count: 1,
						text: '1m'
},
					{
						type: 'month',
						count: 3,
						text: '3m'
}, {
						type: 'month',
						count: 6,
						text: '6m'
}, {
						type: 'ytd',
						text: 'YTD'
}, {
						type: 'year',
						count: 1,
						text: '1y'
}, {
						type: 'all',
						text: 'All'
}],
			},

			title: {
				text: symbol.toUpperCase() + ' Stock Value'
			},

			yAxis: [{
				title: {
					text: 'Stock Value'
				},
				height: 200,
				lineWidth: 2
        }],

			tooltip: {
				valuePrefix: '$',
			},
			series: [{
				type: 'area',
				name: symbol.toUpperCase(),
				data: ohlc,
				fillColor: {
					linearGradient: {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1
					},
					stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
				}
        }],
			credits: {
				enabled: true
			},
			navigation: {
				buttonOptions: {
					enabled: false
				}
			}
		});
	};

	function getOHLC(jsonString) {
		var json = JSON.parse(jsonString);
		var dates = json.Dates || [];
		var elements = json.Elements || [];
		var chartSeries = [];

		if (elements[0]) {
			for (var i = 0, datLen = dates.length; i < datLen; i++) {
				var dat = fixDate(dates[i]);
				var pointData = [
                dat,
                elements[0].DataSeries['open'].values[i],
                elements[0].DataSeries['high'].values[i],
                elements[0].DataSeries['low'].values[i],
                elements[0].DataSeries['close'].values[i]
            ];
				chartSeries.push(pointData);
			};
		}
		return chartSeries;
	};

	function fixDate(dateIn) {
		var dat = new Date(dateIn);
		return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
	};

	//get Interactive Chart API js parameters
	function getInputParams(symbol) {
		return {
			Normalized: false,
			NumberOfDays: 1095,
			DataPeriod: "Day",
			Elements: [
				{
					Symbol: symbol,
					Type: "price",
					Params: ["ohlc"]
            }]
		}
	};

	function genFavoriteTable() {
		var symbols = JSON.parse(localStorage.getItem("symbols"));
		if (symbols) {
			var table = "<br><table style='width:1100px'><tr><th>Symbol</th><th>Company Name</th><th>Stock Price</th><th>Change (Change Percent)</th><th>MarketCap</th><th></th></tr>";
			for (var i = 0; i < symbols.length; i++) {
				table += genFavoriteRow(symbols[i].symbol);
			}
			table += "</table>";
			console.log(table);
			$("#favoriteTable").html(table);
		};
		//enable buttons' events
		//trashcan button removing event
		$(".trashcan").click(function () {
			//delete tr element
			$(this).parents("tr").remove();
			//delete localstorage 
			var num = checkOn($(this).attr("id"));
			var symbols = JSON.parse(localStorage.getItem("symbols"));
			symbols.splice(num - 1, 1);
			localStorage.setItem("symbols", JSON.stringify(symbols));
		});
	}

	//refresh button event
	$("#refresh").click(function () {
		genFavoriteTable();
	})
    var s;
	//toggle button events
	$("#toggle").change(function () {
		if ($(this).prop('checked')) {
			s = setInterval(genFavoriteTable, 5000);
		} else {
			if(s)
			clearInterval(s);
		}
	})

	function genFavoriteRow(symbol) {
		var row = "";
		$.ajax({
			type: "GET",
			url: "http://stocksearchback.appspot.com/index.php",
			datatype: "json",
			data: {
				symbol: symbol
			},
			async: false,
			success: function (json) {
				//obj is a loval variable
				console.log(json);
				var obj = JSON.parse(json);
				row += "<tr>";
				row += "<td>" + "<a class = 'linkQuote' href='#myCarousel' data-slide='next'>" + obj.Symbol + "</a>" + "</td>";
				row += "<td>" + obj.Name + "</td>";
				row += "<td>" + "$ "+obj.LastPrice + "</td>";
				row += upOrDown(obj.Change, obj.ChangePercent);
				row += "<td>" + capCal(obj.MarketCap) + "</td>";
				row += "<td><button type='button' class='btn btn-default btn-sm trashcan' id='" + obj.Symbol + "'><span class='glyphicon glyphicon-trash'></span></button></td>";
				row += "</tr>";
			},
			error: function (e) {
				console.log(e.status);
			}
		});
		return row;
	}
	// next button's event of checking star on or off
	$("#next").click(function () {
		//change star button color according localstorage
		if (obj != null) {
			if (checkOn(obj.Symbol)) {
				$("#star").css("color", "yellow");
			} else {
				$("#star").css("color", "white");
			}
		}
	});

	// clear button's event
	$("#clear").click(function () {
		$("#symbol").val("");
		$("#next").attr("disabled", true);
		$("#validation").hide();
	})

	$(".chartPill").click(
		function () {
			$.ajax({
				type: "GET",
				url: "http://stocksearchback.appspot.com/index.php",
				datatype: "json",
				data: {
					parameters: JSON.stringify(getInputParams(globalSymbol))
				},
				success: function (json) {
					console.log("----------------------Interactive Chart API------------------------");
					//console.log(json);
					render(json, globalSymbol);
				}
			});
	//		$(this).off("click");
		}
	);
    
    $("#logo").click(function(){
		window.open("http://dev.markitondemand.com/MODApis/");
	}
	);
});