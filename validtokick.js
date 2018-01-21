var clanMembers = require ('./clanmembers.js');
var clanIgnore = require ('./clanogs.js');
var main = require ('./bot.js');
var timeout = (1000 * 60 * main.time);
console.log(main.time)
var ranking = 1
var http = require ('http');
//var timeout = (1000 * 60 * 5); //5 minutes
var httpGet = function (url, callback){
	http.get (url, function (res){
		var ret = "";
		
		res.on ('data', function (data){
			ret += data;
		});
		res.on ('end', function (){
			var p = ret;
			try {
				p = JSON.parse (ret);
			} catch (err){
			    console.log (p);	callback ([]);
			};
			
			try {
				callback (p);
			} catch (err) {
			    console.log (p);	callback (false);
			};
		});
	});
};

var method = function (points, channel,time){
	var members = [];
	var notFound = [];
	//var time = time;
	//console.log(time);
	var expire = Date.now( )+ timeout;
	var iterator = null, index = -50;
		iterator = function (){
			index += 50;
			httpGet ('http://www.roblox.com/leaderboards/game/json?targetType=0&distributorTargetId=113491250&timeFilter=2&startIndex=' +  index + '&currentRank=1&previousPoints=3372937&max=50&imgWidth=48&imgHeight=48&imgFormat=PNG', function (data){
				if (Date.now() >= expire || data.length == 0 || members.length == clanMembers.length) {
					members = members.sort (function (a, b){
						return (a.Points == b.Points ? 0 : (a.Points < b.Points ? -1 : 1));
					});
					
					var embed = {
						title: "Members found with less than " + points + " points!",
						fields: []
					};
					
					members.forEach (function (query){
						if (!clanIgnore.find (j => query.Name.toLowerCase() == j.toLowerCase()) && query.Points < points)
							embed.fields.push ({
								name: ranking+". " + query.Name + " (" + query.UserId + ")",
								value: "Points: " + query.FullPoints + " | Rank: " + query.Rank
							});
						ranking++;
					});
					
					clanMembers.forEach (function (userName){
						if (!clanIgnore.find (j => j.toLowerCase() == userName.toLowerCase()) && !members.find (j => j.Name == userName))
							embed.fields.push ({
								name: userName,
								value: "This member was not found on the list, far below required points"
							});
					});
					
					channel.send ('', {
						embed: embed
					});
				} else {
					data.forEach (function (query){
						if (query.ClanName == "Phantom Rangers || Competitive PF Team")
							members.push (query);
					});
					iterator();
				};
			});
		};
		
	iterator();
};

module.exports = method;
