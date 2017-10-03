var request = require('request');
var jwtLib = require('jsonwebtoken');
var jwtBuffer = [];

module.exports.templateTags = [{
    name: 'jwtRefresh',
    displayName: 'JWT refresher',
    description: 'Returns refreshed token from original JWT for IYO authentication',
    args: [
        {
            displayName: 'Environment JWT variable',
            description: 'original JWT from environment',
            type: 'string',
            defaultValue: ''
        },
        {
            displayName: 'JWT lifespan variable',
            description: 'JWT lifespan (in seconds) environmental variable',
            type: 'string',
            defaultValue: ''
        },
        {
            displayName: 'Refresh URL',
            description: 'URL where to fetch the refreshed token',
            type: 'string',
            defaultValue: "https://itsyou.online/v1/oauth/jwt/refresh"
        }
    ],
    async run (ctx, jwtVar, lifespanVar, refreshURL) {
        var jwt = ctx.context[jwtVar];
        var lifespan = Math.floor(ctx.context[lifespanVar]);
        if (lifespan != "" && !Number.isInteger(lifespan)){
            console.log("Invalid or empty jwt lifespan provided");
            lifespan = 0;
        }
        

        if (jwt == null) {
            return;
        }

         // check expiration JWT
         if (getTimeLeftJWT(jwt) > (new Date).getTime() / 1000 + 60) {
            console.log("JWT has not expired");
            return jwt;
        }

        // check if valid jwt in buffer
        // if lifespan is different, don't use cache
        if (inArray(jwtBuffer, jwt) && lifespan == jwtBuffer[jwt]["lifespan"]){
            bJWT = jwtBuffer[jwt]["rjwt"];
            if (getTimeLeftJWT(bJWT) > (new Date).getTime() / 1000 + 60) {
                console.log("Using buffered refreshed JWT");
                return bJWT;
            }
        }

        console.log(ctx.context);
        console.log("JWT to refresh: " + jwt);
        console.log("JWT lifespan: " + lifespan);
        console.log("URL JWT refresh: " + refreshURL);

        try{
            var newToken = await getRefreshedJWT(jwt, refreshURL, lifespan);
            console.log("Refreshed token: " + newToken);
            jwtBuffer[jwt] = {rjwt: newToken, lifespan: lifespan};
            return newToken;
        } catch(err) {
            console.log("Failed to get a refreshed token");
            console.log("Error: " + err);
            return jwt;
        }
    }
}];

function getRefreshedJWT(jwt, refreshURL, lifespan){
    if (lifespan != 0) {
        refreshURL = refreshURL + "?validity=" + lifespan;
    }

    return new Promise(function(resolve, reject) {    
        var options = {
            method: 'GET',
            url: refreshURL,
            headers: {
              "Authorization": "bearer " + jwt
            }
        };
    
        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }

            reject(error);
        });
    });
}

function getTimeLeftJWT(jwt) {
    var decoded = jwtLib.decode(jwt);
    return decoded.exp;
}

function inArray(array, key) {
    return key in array;
  }