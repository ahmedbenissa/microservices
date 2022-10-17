const express = require('express')
const app=express()
const mongoose=require("mongoose")
app.use(express.json())
const path = require('path');
const port= 8901

const PaymentRoutes=require('./routes/Payment_Routes')


const bodyParser = require('body-parser')


const stripe = require('stripe')('sk_test_51LUDGrHuLe1yv6a4UBoCLPlC1xSoytXNTHfyGfgnulPSIqs0DwpmzFzC0gGIQMAdvkICktNLrEUa0eo4AkP2MADb00jjrDSn87');


app.use('/payments',PaymentRoutes)

mongoose.connect('mongodb+srv://ahmed:ahmed@cluster0.iaanx.mongodb.net/MicroservicesMongo?retryWrites=true&w=majority').then((res)=>{
  console.log("connected to mongodb+srv://ahmed:ahmed@cluster0.iaanx.mongodb.net/MicroservicesMongo?retryWrites=true&w=majority")
}).catch((err)=>{
  console.log("not connected")
})

var QRCode = require('qrcode')

QRCode.toString('I am a pony!',{type:'terminal'}, function (err, url) {
  console.log(url)
})
app.listen(port, async() => {
    console.log(`http://localhost:${port}`) 
  })