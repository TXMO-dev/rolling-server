const {Schema,model} = require('mongoose');


const carSchema = new Schema({
    name:{
        type:String
    },
    description:String,
    category:{
        type:String,
        enum:['SUV','Sedan','Hatchback','Sports Car','Coupe','Compact Car','COnvertible','Minivan','Truck','Station Wagon',
        'Crossover','Utility Vehicle','Hybrid','Electric','Luxury Vehicle','Van','Pickup','Off-road','Mid-size','Full-size','Roadstar','Other']
    },
    price:Number,
    reviews:[
        {
            id:String,
            username:String,
            body:String,
            createdAt:String,
        }
    ],
    likes:[
        {
            id:String,
            username:String,
            createdAt:String
        }
    ],
    condition:{
        type:String,
        enum:['Used','New']
    },
    Deal:{
        type:String,
        enum:['Negotiable','Non-Negotiable']
    },
   


    Image:{
        id:String,
        filename:String,
        mimetype:String,
        path:String,
        uploaded_at:Date
    },
    Images:[
        {
            id:String,
            filename:String,
            mimetype:String,
            path:String,
            uploaded_at:Date
        }
    ],
    createdAt:String

});

const Car = model('Car',carSchema);

module.exports = Car;