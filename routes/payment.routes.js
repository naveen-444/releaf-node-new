const express = require('express');
const router = express.Router();
const merchantAuthenticationType= require('../payments/authorizeNetConfig')
const sdk = require('authorizenet');
const { APIContracts, APIControllers } = sdk;


router.post('/create-payment-profile',async function (req,res){
    const customerProfile = new APIContracts.CustomerProfileType();
    customerProfile.setEmail(req.body.email)

    const createRequest = new APIContracts.CreateCustomerProfileRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setProfile(customerProfile);

    const ctrl = new APIControllers.CreateCustomerProfileController(createRequest.getJSON());


    ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateCustomerProfileResponse(apiResponse);

        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
            
            return res.json( {   customerProfileId: response.getCustomerProfileId(),
                message: response.getMessages().getMessage()[0].getText()
            }
        )
        } else {
           
             return res.json(  {success:false, message: response.getMessages().getMessage()[0].getText()
            });
        }
    });
})

router.get('/request-payment-page', async function (req, res) {
    // Create a transaction request type
    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequestType.setAmount('30'); // Ensure this is a valid amount

    // Set up hosted payment page settings
    const setting1 = new APIContracts.SettingType();
    setting1.setSettingName('hostedPaymentReturnOptions');
    setting1.setSettingValue(JSON.stringify({
        "showReceipt": false,
        "url": "https://releaf-specialists-rect-nextjs.vercel.app/doctors", // Update to your local testing URL
        "urlText": "Continue",
        "cancelUrl": "https://releaf-specialists-rect-nextjs.vercel", // Update to your local testing URL
       
        "cancelUrlText": "Cancel",
        
    }));

    const setting2 = new APIContracts.SettingType();
    setting2.setSettingName('hostedPaymentButtonOptions');
    setting2.setSettingValue(JSON.stringify({ "text": "Pay" }));

    const setting3 = new APIContracts.SettingType();
    setting3.setSettingName('hostedPaymentOrderOptions');
    setting3.setSettingValue(JSON.stringify({ "show": true, "merchantName": "Releaf Specialist" }));

    // Create the hosted payment page request
    const request = new APIContracts.GetHostedPaymentPageRequest();
    request.setMerchantAuthentication(merchantAuthenticationType); // Your credentials
    request.setTransactionRequest(transactionRequestType);
    
    // Pass an array of SettingType instances to ArrayOfSetting
    const settingsArray = [setting1, setting2, setting3];
    request.setHostedPaymentSettings(new APIContracts.ArrayOfSetting(settingsArray));

    // Create a controller to send the request
    const ctrl = new APIControllers.GetHostedPaymentPageController(request.getJSON());

    ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.GetHostedPaymentPageResponse(apiResponse);

        // Log the full API response for debugging
        console.log("Full API Response:", apiResponse);

        const resultCode = response.getMessages().getResultCode();
        const errorMessages = response.getMessages().getMessage();

        if (resultCode === APIContracts.MessageTypeEnum.OK) {
            // On success, return the token
            const token = response.getToken();
            return res.json({ success: true, token: token });
        } else {
            // Log detailed error message for debugging
            console.error("Error Messages:", errorMessages);

            return res.json({
                success: false,
                message: errorMessages[0].getText()
            });
        }
    });
});
// // Redirect the user to the Hosted Payment Page with the token
// router.get('/pay', async function (req, res) {
//     const token = req.query.token;

//     if (!token) {
//         return res.status(400).json({ error: 'Missing token' });
//     }

//     const orderData = {
//         orderId: 'order_' + Date.now(),
//         customerName: 'John Doe',
//         email: 'john.doe@example.com'
//     };

//     const paymentPageUrl = `https://test.authorize.net/payment/payment`;
//     const redirectUrl = `${paymentPageUrl}?token=${token}`;

//     return res.json({ url: redirectUrl });
// });

module.exports = router;