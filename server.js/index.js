/* eslint-disable */

const express = require('express')
const app = express();
const stripe = require('stripe')('sk_test_JdQLzcxjPSolVPg096nI2uF800pF0EtqZy')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/customer-id' , async (req, res)=>{
    console.log('REQ.BODY', req.body.email);
    userEmail = req.body.email
    try{
        const customer = await stripe.customers.create({ email:  userEmail  });
        res.status(200).json({
            response: customer,
        }) 
    }
    catch(e){
        console.log('Error', e);
        
        res.status(400).json({
            errorMessage: e
        })
    } 
})

app.post('/customer-source' , async (req, res)=>{
    const { customer, token } = req.body
    try{
        const fingerPrint =  await stripe.customers.createSource(customer, {
            source: token
          });
        res.status(200).json({
            response: fingerPrint,
        }) 
    }
    catch(e){
        console.log('Error', e);
        
        res.status(400).json({
            errorMessage: e
        })
    } 
})
app.post('/charge-customer' , async (req, res)=>{
    const { customer, amount, source } = req.body
    const charge = {
        customer : customer,
        amount,
        currency: 'usd',
        source
    }
    console.log('Charge =======>' , charge);
    
    const idempotencyKey = Date.now()
    try{
        const response =  await stripe.charges.create(charge, {
            idempotency_key: idempotencyKey
          });
        res.status(200).json({
            response
        }) 
    }
    catch(e){
        console.log('Error', e);
        
        res.status(400).json({
            errorMessage: e
        })
    } 
})
app.listen('3000', () => {
  console.log(`Server is running 3000`);
})