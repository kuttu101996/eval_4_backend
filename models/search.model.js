const { default: mongoose } = require("mongoose")
const momngoose = require("mongoose")

const searchSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    city: {type: [String]}
})


const Searches = mongoose.model("search", searchSchema)


module.exports = {
    Searches
}