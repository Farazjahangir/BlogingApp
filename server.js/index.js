/* eslint-disable */

const express = require('express')
const app = express();
const stripe = require('stripe')('sk_test_JdQLzcxjPSolVPg096nI2uF800pF0EtqZy')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/product-payment' , async (req, res)=>{
    console.log('REQ.BODY', req.body.email);
    userEmail = req.body.email
    try{
        const customer = await stripe.customers.create({ email:  userEmail  });
        res.status(200).send({
            response: customer,
        }) 
    }
    catch(e){
        console.log('Error', e);
        
        res.status(400).send({
            errorMessage: e
        })
    }
    
})
app.listen('3000', () => {
  console.log(`Server is running 3000`);
})