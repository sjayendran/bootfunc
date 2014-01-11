var mongoose = require('mongoose')
  , Share = mongoose.model('Share')
  , Song = mongoose.model('Song')
  , _ = require('lodash')
  , request = require('request')
  , url = require('url')
  , fqlURL = 'https://graph.facebook.com/fql?q=#QUERY#&access_token=#TOKEN#'
  , fqlPersonalYoutubeLinkQuery = "SELECT link_id, title, created_time, owner_comment, picture, summary, owner, url FROM link WHERE owner = me() AND strpos(url,'youtube.com') >=0 AND created_time > #LAST_TIME# ORDER BY created_time LIMIT 50"
  , ytValidityCheckURL = "https://gdata.youtube.com/feeds/api/videos/#VID_ID#?v=2"
  , lastFmURL = "http://ws.audioscrobbler.com/2.0/?method=track.search&track=###TRACKQUERY###&api_key=3135d1eacd6085271c24a02d4195cccf&format=json";

exports.create = function(req, res) {
  var share = new Share({
    shareId: req.body.shareId,
    userID: req.body.userID,
    network: req.body.network,
    using: req.body.using,
    link: req.body.link,
    systemTimestamp: req.body.timestamp,
    humanTimestamp: req.body.timestamp * 1000
  });
  
  share.save( function( err ) {
    if(! err ) {
      res.jsonp(share);
    } else {
      res.render(err , {status: 500});
    }
  });
 }

/**
 * Show an article
 */
exports.show = function(req, res) {
    res.jsonp(req.share);
};

/**
 * List of Shares
 */
exports.all = function(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var req_validity = query.valid;
    var req_token = query.tok;
    var req_userid = query.userid;
    console.log('token:'+ query.tok);
    console.log('validity:'+ query.valid);
    console.log('this the requested userid: '+ req_userid);
    //setInterval(getFBShares(req_token), 10000);
    if(typeof req_validity != 'undefined' && req_validity != null && req_validity != "")
    {
      console.log('IN SPECIFIC SHARES SEARCH!!!');
      /*Share.find({"valid": req_validity, "lastfmCheck": "VALID"}).sort('-dt').exec(function(err, shares) { ORIGINAL query from shares
      Song.find({ "sharedBy": { $regex: req_userid+'*', $options: 'i' } }).sort('-dt').exec(function(err, shares) { - ORIGINAL working query from SONGS
      Song.find.and([ { "sharedBy": { $regex: req_userid+'*', $options: 'i' }}, { "aeCount": { $lt: 1 } } ]).sort('-dt').exec(function(err, shares) {*/
      //where('aeCount').lt(1).
      Song.find({ "sharedBy": { $regex: req_userid+'*', $options: 'i' } }).where('aeCount').exists(false).sort('-dt').exec(function(err, shares) {
          if (err) {
              console.log('encountered an error while trying to get shares!');
              res.render('error', {
                  status: 500
              });
          } else {
              console.log('this is the result from the share find method: '+ shares);
              res.jsonp(shares);
          }
      });
    }
    else
    {
      Share.find().sort('timestamp').exec(function(err, shares) {
          if (err) {
              //console.log('encountered an error while trying to get shares!');
              res.render('error', {
                  status: 500
              });
          } else {
              //console.log('this is the result from the share find method: '+ shares);
              res.jsonp(shares);
          }
      });
    }
};

exports.getFB = function(req, res) {
  console.log('this is the auth TOKEN i got: ' + req.params.token);
  // find each person with a last name matching 'Ghost'
  getFBShares(req.params.token);
  console.log('this is the validity param: '+ req.params.valid);
};

/**
 * Update a song listen count
 */
exports.updateListen = function(req, res) {
    //console.log('going to update the listen count for: '+ req.params.songId);
    var searchString = "";
    if (req.params.type == "yt")
    {
      searchString = "http://www.youtube.com/watch?v=" + req.params.songId;
    }
    Song.findById({ "_id": searchString }, function (err, song) {
        if(typeof song != 'undefined' && song != null && song != "")
        {
          console.log('found this song: ' + song.st);
          console.log("gonna change the listen count from this: " + song.listenCount + " to this: " + req.params.count);
          song.listenCount = req.params.count ;
          song.save(function( err ) {
            if(! err ) {
              //res.jsonp(share);
              //console.log('ERROR while trying to update song listen count: '+ song);
            }
            else
              console.log('ERROR while trying to update song listen count: '+ err);
          });
        }
        else
          console.log('didnt find shit!');
	    });
};

/**
 * Update a song's auto error count - automatically detected through youtube error
 */
exports.updateAEC = function(req, res) {
    console.log('going to update the auto error count for: '+ req.params.songId);
    var searchString = "";
    if (req.params.type == "yt")
    {
      searchString = "http://www.youtube.com/watch?v=" + req.params.songId;
    }
    Song.findById({ "_id": searchString }, function (err, song) {
        if(typeof song != 'undefined' && song != null && song != "")
        {
          console.log('found this song: ' + song.st);
          console.log("gonna change the auto error count from this: " + song.aeCount + " to this: " + req.params.count);
          song.aeCount = req.params.count ;
          song.save(function( err ) {
            if(! err ) {
              //res.jsonp(share);
              //console.log('ERROR while trying to update song listen count: '+ song);
            }
            else
              console.log('ERROR while trying to update song listen count: '+ err);
          });
        }
        else
          console.log('didnt find shit!');
	    });
};

function insertNewShare(fbShareData, network, via, ytResult)
{
  var share = new Share({
    _id : fbShareData.link_id.toString(), 
    using : via, 
    dt : fbShareData.created_time,
    humandt: new Date(fbShareData.created_time*1000),
    msg : fbShareData.owner_comment, 
    ntw : network,
    sl : fbShareData.url,
    st : fbShareData.title, 
    uid : fbShareData.owner.toString(),
    ytCheck: ytResult});
  share.save( function( err ) {
    if(! err ) {
      //res.jsonp(share);
      //console.log('SHARE saved '+ share.st + ' successfully to db!');
    } else {
      //res.render(err , {status: 500});
      //console.log('error saving share: '+ err);
    }
  });
}

function insertNewSong(fbShareData, source,  using, type, artist, title)
{
  var song = new Song({
    _id : fbShareData.url.toString(), 
    dataSource: source,
    using : using,
    sa : artist.trim(),
    st : title.trim(),
    type: type});
	song.sharedBy.push(fbShareData.owner.toString()+"||"+fbShareData.created_time);
	song.save( function( err ) {
	if(! err ) {
	  //res.jsonp(share);
	  //console.log('saved '+ song.st + ' successfully to db!');
	} else {
	  //res.render(err , {status: 500});
		if(err.toString().indexOf("E11000 duplicate key error") >= 0)
		{
			//console.log('DUPLICATE SONG ERROR; cannot save: '+ err);
			Song.findById(fbShareData.url.toString(), function (err, song) {
        if(typeof song != 'undefined' && song != null && song != "")
        {
          song.listenCount += 1 ;
          song.save(function( err ) {
            if(! err ) {
              //res.jsonp(share);
              //console.log('DUPLICATE SONG; LISTEN COUNT UPDATED FOR:  '+ title.trim());
            }					
          });
        }
			});
		}
		}
	});
}

function updateSong(srchVal, setVal) //set largeAlbumArt to the trackquery being passed into Last.FM validity check
{
  Song.findById(srchVal, function (err, song) {
    if(typeof song != 'undefined' && song != null && song != "")
    {
      song.largeAlbumArt = setVal;
      song.save(function( err ) {
        if(! err ) {
          //res.jsonp(share);
          //console.log('updated songs album artwork!!!');
        }
        else
          console.log("this is the lastfm pre-check error: " + err);
      });
    }
    else
        console.log('DID NOT FIND A SONG TO UDPATE: '+ setVal + ' and this is the error: ' + err);
  });
  
}

function getFBShares(authToken)
{
  console.log('hopefully this gets called EVERY 10 SECONDS!');
  var lastdt;
  Share.find({})
    .sort('-dt')
    .exec(function(err, doc)
    {
      //console.log('this is the IMMEDIATE RESULT:' + doc+ "!");
      if(typeof doc != 'undefined' && doc != null && doc != "")
      {
        var jsonObj = JSON.parse(JSON.stringify(doc[0]));
        console.log('this is the timestamp value of the result: ' + jsonObj.dt);
        lastdt = jsonObj.dt;
      }
      else
      {
        console.log('we got nothing in the db!');
        lastdt = 0;
      }
      console.log('THIS IS THE DAMN QUERY: '+ fqlURL.replace('#QUERY#',fqlPersonalYoutubeLinkQuery.replace('#LAST_TIME#',lastdt)).replace('#TOKEN#',authToken));
      getFBYoutubeShares(authToken, lastdt)
    }); 
}

function getFBYoutubeShares(token, last_timestamp)
{
  //get last 50 shares from FB
  request(fqlURL.replace('#QUERY#',fqlPersonalYoutubeLinkQuery.replace('#LAST_TIME#',last_timestamp)).replace('#TOKEN#',token), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('this is the JSON parsed length of result: '+ JSON.parse(body).data.length);
      var fbyt = JSON.parse(body).data; //put resultset into array

      //traverse through array and check each link for Youtube validity
      checkYoutubeValidity(fbyt);
      //res.jsonp(body); THIS IS TO RETURN THE DATA - we need to process it first
    }
  });
}

function checkYoutubeValidity(FBYTResultSet)
{
  var counter = 0;
  //fist create VID ID set
  var vidIDSet = [];
  while(counter < FBYTResultSet.length)
  {
    vidIDSet[counter] = FBYTResultSet[counter].url.toString().substring(FBYTResultSet[counter].url.toString().indexOf("v=")+2);    
	  counter++;
  }
  
  //then traverse through VID ID set and check Youtube for validity
  counter = 0;
  while(counter < vidIDSet.length)
  {
    request(ytValidityCheckURL.replace('#VID_ID#',vidIDSet[counter]), function (error, response, body) {
      //console.log('this is what the response object has: '+ Object.keys(response));
      //console.log('this is what the body object has: ' + response.body);
		if (!error && response.statusCode == 200) {
			var linkBegin = response.body.indexOf("<link");
			var linkEnd = response.body.indexOf("/>",linkBegin);
			var idBegin = response.body.indexOf("watch?v=",linkBegin)+8;
			var idEnd = response.body.indexOf("&amp",idBegin);
			var linkID = response.body.substring(idBegin,idEnd);
			var fbResult = FBYTResultSet[vidIDSet.indexOf(linkID)]

			if(response.body.indexOf("categories.cat' term='Music'") < 0)
			{	
			  //console.log("INVALID video: " + response.body.substring(linkBegin,linkEnd)+"!!!!!! for MUSIC is: "+response.body.indexOf("categories.cat' term='Music'"));
			  //console.log("the vidID for that link is: "+linkID);
			  //console.log("FB body for same link is: "+fbResult.url+"!!!! and title is: "+fbResult.title);
			  try//insert INVALID shares found from FB to shares collection, tagged as INVALID
			  {
				  insertNewShare(fbResult, "FB", "FB", "INVALID");            
			  }
			  catch(err)
			  {
				  if(err.message.indexOf("E11000 duplicate key error") < 0) //valid error
				  {
					console.log("Error while inserting unidentifiable LINK in SHARES collection: " + err.message.indexOf("MongoError: E11000 duplicate key error index"));
					console.log("error while updating internal data: "+ err.message + ": this one already exists: "+ fbResult.title);						
					return "error";//console.log("error while updating internal data: "+ err + ": this one already exists: "+ fbLinkList[linkCount].title);						
				  }
			  }
			}
			else
			{	
				//console.log("This is a VALID video: "+response.body.substring(linkBegin,linkEnd)+"!!!!!! for MUSIC is: "+response.body.indexOf("categories.cat' term='Music'"));
				try//insert identifiable shares found from FB to shares collection
				{			
					insertNewShare(fbResult, "FB", "FB", "VALID");				
				}
				catch(err)
				{
					if(err.message.indexOf("E11000 duplicate key error") < 0) //valid error
					{
						//console.log("Error while inserting proper LINK in SHARES collection: " + err.message.indexOf("MongoError: E11000 duplicate key error index"));
						console.log("Error while inserting proper LINK in SHARES collection: "+ err.message + ": this one already exists: "+ fbResult.title);						
						return "error";//console.log("error while updating internal data: "+ err + ": this one already exists: "+ fbLinkList[linkCount].title);						
					}
				}

				try//insert identifiable vids found from FB to videos collection
				{
					var artist = "";
					var title = "";
					if(fbResult.title.indexOf("-") >= 0)
					{
						artist = fbResult.title.split("-")[0].toUpperCase();
						title = fbResult.title.split("-")[1].toUpperCase();
					}
					else if(fbResult.title.indexOf(":") >= 0)
					{
						artist = fbResult.title.split(":")[0].toUpperCase();
						title = fbResult.title.split(":")[1].toUpperCase();
					}
					else if(fbResult.title != "")
					{
						artist = "";
						title = fbResult.title.toUpperCase();
					}

					insertNewSong(fbResult, "FB", "FB", "youtube", artist, title)
				}
				catch(err)
				{
					if(err.message.indexOf("E11000 duplicate key error") < 0) //valid error
					{
						//console.log("Error while inserting proper Video in Videos collection: " + err.message.indexOf("MongoError: E11000 duplicate key error index"));
						console.log("OTHER SONG error while updating internal data: "+ err.message + ": this one already exists: "+ fbResult.title);						
						//console.log("error while updating internal data: "+ err + ": this one already exists: "+ fbLinkList[linkCount].title);						
					}
					else if(err.message.indexOf("E11000 duplicate key error") >= 0)
					{
						console.log("duplicate SONG error:"+err+"; WILL update: "+ fbResult.title);
						//Song.update({_id:fbResult.url}, {$set: {dataSource: "FB"},$push: {sharedBy: fbResult.owner.toString()+"||"+millisecondDate}});
					}
					return "error";
				}
			}
		}
    });
    counter++;
  }
  console.log("FINISHED CHECKING Youtube validity!!!");
  getLastFMPending();
}


function getLastFMPending()
{
  console.log('INSIDE LAST FM METHOD!');
  Share.find({"lastfmCheck": "PENDING"})
    .exec(function(err, doc)
    {
      //console.log('this is the immediate LAST FM PENDING RESULT:' + doc+ "!");
      if(typeof doc != 'undefined' && doc != null && doc != "")
      {
        var lastFMPending = JSON.parse(JSON.stringify(doc));
        console.log('this is the size of the last fm PENDING objects: '+ lastFMPending.length);
        checkLastfmValidity(lastFMPending);
      }
      else
      {
        console.log('we got nothing in the db!');
      }
    });
}

function checkLastfmValidity(pendingShares)
{
  var counter = 0;
  
  var cleanedTrackQuery = [];

  //set up song collection with track query so as to identify it post last fm search
  while(counter < pendingShares.length)
  {
    cleanedTrackQuery[counter] = cleanTrackQueryPriorToLastFMCheck(pendingShares[counter].st);
    
    //console.log('search for this on LAST.FM: '+ cleanedTrackQuery + ' and this is the YOUTUBE STATUS: '+ pendingShares[counter].ytCheck);
    
    updateSong(pendingShares[counter].sl, cleanedTrackQuery[counter]);
    
    counter++;
  }
  
  console.log('finished initializing data prior to lastfm check!');
  
  var counter = 0;
  //check Last.FM for validity
  while(counter < pendingShares.length)
  {
    request(lastFmURL.replace("###TRACKQUERY###",cleanedTrackQuery[counter]), function (error, response, body) {
      //console.log('this is what the response object has: '+ Object.keys(response));
      //console.log('this is what the body object has: ' + response.body);
		if (response.statusCode === 200) {
          //console.log("Last fm query result is: "+ LFMResult.content);
          var LFMResultList = JSON.parse(body);//y.results.trackmatches.track[0]
          //console.log('this is the pure LASTFM body: '+ body);
          //console.log('this is the LFM RESULT LIST: ' + LFMResultList);
          //if last.fm has a track match get the artist / song / album art details to update DB with
          
          if(LFMResultList.results != undefined && LFMResultList.results.trackmatches.track != undefined && LFMResultList.results.trackmatches.track.length > 0){
            var LFMArtist = "";
            var LFMTitle = "";
            if(LFMResultList.results.trackmatches.track[0].artist != "[unknown]")
            {
              LFMArtist = LFMResultList.results.trackmatches.track[0].artist;
              LFMTitle = LFMResultList.results.trackmatches.track[0].name;
            }
            else if(LFMResultList.results.trackmatches.track[1] != undefined && LFMResultList.results.trackmatches.track[1].artist != "[unknown]")
            {
              LFMArtist = LFMResultList.results.trackmatches.track[1].artist;
              LFMTitle = LFMResultList.results.trackmatches.track[1].name;
            }								
            
            var LFMlargeAlbumArt = "";
            var LFMmediumAlbumArt = "";
            if(LFMResultList.results.trackmatches.track[0].image != undefined)
            {
              if(LFMResultList.results.trackmatches.track[0].image.length == 4)
              {
                LFMlargeAlbumArt = LFMResultList.results.trackmatches.track[0].image[3]["#text"];
                LFMmediumAlbumArt = LFMResultList.results.trackmatches.track[0].image[2]["#text"];
              }
              else if(LFMResultList.results.trackmatches.track[0].image.length > 0)
              {
                var artIndex = LFMResultList.results.trackmatches.track[0].image.length -1;
                LFMlargeAlbumArt = LFMResultList.results.trackmatches.track[0].image[artIndex]["#text"];
              }
              //console.log("the working result album art is: "+ LFMlargeAlbumArt);
            }
            //console.log("the working result ARTIST is: "+ LFMArtist);
            //console.log("the working result title is: "+ LFMTitle);

            try
            {
              //console.log('trying to update album art; GENERAL CASE: SEARCH TERMS: '+LFMResultList.results["opensearch:Query"].searchTerms);
              updateSongWithLastFMData(LFMResultList.results["opensearch:Query"].searchTerms, LFMlargeAlbumArt, LFMmediumAlbumArt, LFMArtist, LFMTitle, "FB");  
            }
            catch(err)
            {
              //console.log("OTHER SONG error while updating vid with LFM results: "+ err.message + ": this one already exists: "+ LFMResultList.results["opensearch:Query"].searchTerms);	
            }
            
            //console.log("Last FM result size is: "+ LFMResultList.length);
            //console.log("groovit message is: "+pureFBYTResultSet[gCount].message);
            //console.log("groovit attachment title is: "+pureFBYTResultSet[gCount].attachment.media[0].alt);
            //console.log("groovit attachment link is: "+pureFBYTResultSet[gCount].attachment.media[0].href);	
            //console.log("groovit post ID is: "+pureFBYTResultSet[gCount].post_id.split("_")[1]);	
          }
		  else
		  {
			//console.log('this is the pendingShares '+ counter +' object being marked as invalid: '+ pendingShares[counter]);
			if(counter < pendingShares.length)
				markSharePostLastFmValidityCheck(pendingShares[counter].sl, false);
		  }
		}	
		else
		{
			if(counter < pendingShares.length)
				markSharePostLastFmValidityCheck(pendingShares[counter].sl, false);
		}
      });
    counter++;
	console.log('this is the new counter in the last fm check : '+ counter);
  }
}

function cleanTrackQueryPriorToLastFMCheck(trackQuery)
{
  //clean up track information for searching Last.FM
	if(trackQuery.indexOf("(") >= 0 && trackQuery.indexOf(")") >= 0)
	{
		var insideBraces = trackQuery.substring(trackQuery.indexOf("(")+1,trackQuery.indexOf(")"));
		trackQuery = trackQuery.replace(insideBraces," ");
		//console.log("what's inside the braces" + insideBraces);
	}
	else if(trackQuery.indexOf("[") >= 0 && trackQuery.indexOf("]") >= 0)
	{
		var insideBraces = trackQuery.substring(trackQuery.indexOf("[")+1,trackQuery.indexOf("]"));
		trackQuery = trackQuery.replace(insideBraces," ");
		//console.log("what's inside the braces" + insideBraces);
	}
	else if(trackQuery.indexOf("{") >= 0 && trackQuery.indexOf("}") >= 0)
	{
		var insideBraces = trackQuery.substring(trackQuery.indexOf("{")+1,trackQuery.indexOf("}"));
		trackQuery = trackQuery.replace(insideBraces," ");
		//console.log("what's inside the braces" + insideBraces);
	}
  
  trackQuery = trackQuery.toUpperCase();
  trackQuery = trackQuery.replace("LYRICS"," ");
  trackQuery = trackQuery.replace("OFFICIAL VIDEO"," ");
  trackQuery = trackQuery.replace("MUSIC VIDEO"," ");
  trackQuery = trackQuery.replace(" FT."," ");
  trackQuery = trackQuery.replace(" BY "," ");
  
  //console.log("the track query ISSS1: "+ trackQuery);					
  
  trackQuery = trackQuery.replace(/[^A-Za-z0-9]/g, " "); //remove special characters - simpler regex
  trackQuery = trackQuery.replace(/\s{2,}/g, " "); //remove extra whitespace
  trackQuery = trackQuery.trim();
  
  return trackQuery;
}


//mark share as VALID or INVALID based on LastFM validity check and mark the share entirely VALID or INVALID accordingly
function markSharePostLastFmValidityCheck(link,result)
{
  var validity = "";
  if(result)
    validity = "VALID";
  else
    validity = "INVALID";
  
  console.log("MARKING THIS SHARE: "+ link + " as "+ validity);
  
  Share.findOne({"sl" : link})
  .exec(function(err, share)
        {
          if(typeof share != 'undefined' && share != null && share != "")
          {
            share.lastfmCheck = validity;
            share.valid = validity;
            
            share.save(function( err ) {
              if(! err ) {
                //res.jsonp(share);
                //console.log('finished marking share as '+validity+' ENTIRELY!');
              }					
            });            
          }
          else
          {
            console.log('COULDNT FIND ANY SHARE TO FINALIZE!!!');
          }
        });
}

function updateSongWithLastFMData(searchQuery, largeArt, mediumArt, artist, title, source)
{
  Song.findOne({"largeAlbumArt" : searchQuery})
  .exec(function(err, doc)
        {
          //console.log('this is the immediate LAST FM PENDING RESULT:' + doc+ "!");
          if(typeof doc != 'undefined' && doc != null && doc != "")
          {
            var song = doc;
            //console.log("this is the song's object keys: " + Object.keys(song));
            song.sa = artist;
            song.st = title;
            song.dataSource = source;
            song.largeAlbumArt = largeArt;
            song.mediumAlbumArt = mediumArt
            
            song.save(function( err ) {
              if(! err ) {
                //res.jsonp(share);
                //console.log('finished updating with last fm data case 1: '+ searchQuery);
              }					
            });
            
            //once confirmed of LAST FM validity, mark the share accordingly
            markSharePostLastFmValidityCheck(song['_id'], true);
          }
          else
          {
            console.log('cant find anything to update with lastfm data; case 1');            
          }
        });
}