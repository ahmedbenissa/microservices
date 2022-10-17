const exp=require('express')
const route=exp.Router()
const mongoose = require('mongoose')
const Payments=require('../Entities/Payment')
var QRCode = require('qrcode')
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AWla8-NynFHzR2idw-3ZrJXi2Fq_EvEJe9W7YiwWlO2B1SARjr2evfpOIc2Oa94G5qm9wlOtFE9RiJCF',
  'client_secret': 'EN70Okt8s3Ad8q_ofzw7rroY1eVk1BH0xGX_VQ7h3OUUc01Z9vd5EFsCLGTTWyjm2l39COghQmWtW5NR'
});

route.post('/Confirm_payment',async(req,res)=>{
    let total=0
    for(let i =0 ; i < req.body.Products.length;i++)
    {
        total=total+req.body.Products[i].price
    }
Payments.create({
    customer:req.body.customer,
    Products:req.body.Products,
    total:total,
    Payment_Method:req.body.Payment_Method,
    date_of_purchase:Date.now()
},(err,docs)=>{
    if(err){
        res.send(err)
        
    }
    else res.send(docs)
})
})
route.get('/list_payments',async(req,res)=>{
    Payments.find({},(err,docs)=>{
        if(err){
            res.send(err)
            
        }
        else res.send(docs)
    })
    })
route.get('/list_payments/:id',async(req,res)=>{
    await Payments.find({_id:req.params.id},(err,docs)=>{
        if(err)
        {
            res.send(err)
        }
else res.send(docs)
})
})

route.get('/revenue_per_day',async(req,res)=>{
    await Payments.aggregate(
      [
       {
           $group:{ _id: {
              month: { $month: "$date_of_purchase" },
              year: { $year: "$date_of_purchase" },
              day: { $dayOfMonth: "$date_of_purchase" },
            },total:{$sum:'$total'}}
        }
      ],
      function (err, docs) {
        if (err) res.send(err);
        else res.send(docs);
      }
    );
  })
  route.get('/revenue_per_month',async(req,res)=>{
    await Payments.aggregate(
      [
       {
           $group:{ _id: {
              month: { $month: "$date_of_purchase" }
            },total:{$sum:'$total'}}
        }
      ],
      function (err, docs) {
        if (err) res.send(err);
        else res.send(docs);
      }
    );
  })
  route.get('/payment_methods',async(req,res)=>{
    await Payments.aggregate(
      [
         {
            $group:{ _id: "$Payment_Method",total:{$sum:1}}
         }
        
      ],
      function (err, docs) {
        if (err) res.send(err);
        else res.send(docs);
      }
    );
  })
const stripe = require('stripe')('sk_test_51LUDGrHuLe1yv6a4UBoCLPlC1xSoytXNTHfyGfgnulPSIqs0DwpmzFzC0gGIQMAdvkICktNLrEUa0eo4AkP2MADb00jjrDSn87');
route.post('/credit_card/:customer_email/:amount',async(req,res)=>{
    const stripe_customer =  await stripe.customers.search({
      query: 'email:\''+req.params.customer_email+'\'',
    });
    console.log(stripe_customer.data)
    if(stripe_customer.data.length==0){
      res.send("Transaction Failed")
    }
    else{
    console.log(stripe_customer.data[0].id)
    const paymentMethods = await stripe.customers.listPaymentMethods(
      stripe_customer.data[0].id,
      {type: 'card'}
    );
    console.log(paymentMethods)
    console.log(paymentMethods.data[0].id)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.params.amount,
      currency: 'usd',
      payment_method_types: ['card'],
      payment_method: paymentMethods.data[0].id,
      customer:stripe_customer.data[0].id,
      confirm:true
    });
    res.send(paymentIntent)
  }})
  QRCode.toString('Lenovo',{type:'terminal'}, function (err, url) {
    console.log(url)
  })
  route.post('/register_credit_card/:cus_name/:cus_email',async(req,res)=>{
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc,
      },
    });
    console.log(paymentMethod)
    const customer = await stripe.customers.create({
      description: 'My First Test Customer (created for API docs at https://www.stripe.com/docs/api)',
      name:req.params.cus_name,
      email:req.params.cus_email
    });
    const paymentMethod2 = await stripe.paymentMethods.attach(
      paymentMethod.id,
      {customer: customer.id}
    );
    res.send(paymentMethod2)
  
  })
  route.get('/success/:amount',async (req,res)=>{

    console.log(req.params.amount)
    const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
    console.log(payerId)
      const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": req.params.amount
            }
        }]
      };
       
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            ;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
    })
module.exports=route