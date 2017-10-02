var request = require('request');

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
            displayName: 'JWT string',
            description: 'original JWT string',
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
    async run (ctx, jwtVar, jwtStr, refreshURL) {
        console.log(ctx.context);
        console.log("JWT var to refresh: " + jwtVar);
        console.log("JWT to refresh: " + jwtStr);
        console.log("URL JWT refresh: " + refreshURL);
        
        jwt = ctx.context[jwtVar];
        if (jwtStr != "") {
            var jwt = jwtStr;
        }

        try{
            var newToken = await getRefreshedJWT(jwt, refreshURL);
            console.log("Refreshed token: " + newToken);
            return newToken;
        } catch(err) {
            console.log("Failed to get a refreshed token");
            console.log("Error: " + err);
            return jwt;
        }
    }
}];

function getRefreshedJWT(jwt, refreshURL){
    console.log("JWT to refresh: " + jwt);
    console.log("URL JWT refresh: " + refreshURL);
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