const {Schema,model} = require('mongoose');


const carSchema = new Schema({
    name:{
        type:String
    },
    description:String,
    category:{
        type:String,
        enum:['SUV','Sedan','Hatchback','Sports Car','Coupe','Compact Car','Convertible','Minivan','Truck','Station Wagon',
        'Crossover','Utility Vehicle','Hybrid','Electric','Luxury Vehicle','Van','Pickup','Off-road','Mid-size','Full-size','Roadstar','Other']
    },
    price:Number,
    reviews:[
        {
            id:String,
            username:String,
            body:String,
            generated_id:String,
            createdAt:String,
            
        }
    ],
    likes:[
        {
            id:String,
            username:String,
            createdAt:Date
        }
    ],
    condition:{
        type:String,
        enum:['Used','New']
    },
    deal:{
        type:String,
        enum:['Negotiable','Non-Negotiable']
    },
   
    dealer:String,

    Images:[  
        {
            name:String,  
            filename:String,
            mimetype:String,
            path:String,
            uploaded_at:Date
        }
    ],
    likeCount:{
        type:Number,
        default:0
    },
    reviewCount:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date
    }
    

});

const Car = model('Car',carSchema);

module.exports = Car;