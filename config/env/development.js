module.exports = {
    db: "mongodb://groovadmin:intermedia2012@ds053658.mongolab.com:53658/heroku_app19586784",
    app: {
        name: "groovly"
    },
    facebook: {
        clientID: "140246246143957",
        clientSecret: "50db7c9bc459749f00ee92e53b8e5624",
        callbackURL: "http://freshstart-49501.apse1.actionbox.io/auth/facebook/callback"
    },
    twitter: {
        clientID: "CONSUMER_KEY",
        clientSecret: "CONSUMER_SECRET",
        callbackURL: "http://localhost:3000/auth/twitter/callback"
    },
    github: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    google: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/google/callback"
    }
}