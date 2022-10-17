const mongoose=require('mongoose')
const PaymentSchema=  mongoose.Schema(
   { 
    customer:String,
    Products:[{
        name:String,
        price:Number
    }],
    total:Number,
    Payment_Method:String,
    date_of_purchase:Date
    
   })
module.exports=mongoose.model('payments',PaymentSchema)