


export const otpTemplateDesign = (
  otp,
  userName = "new user"
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color:rgb(7, 142, 93);
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color:rgb(196, 241, 48);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 5px 5px 8px rgba(0, 0, 0, 0.9);
        }
            h1:{
            color:rgb(35, 45, 226)
            }
        .header {
            text-align: center;
            padding: 10px 0;
           
        }
            
        .content {
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: rgb(86, 105, 11);
        }
            span{
            color: red;
            }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1> OTP CODE</h1>
        </div>

        <div class="content">
            <p>Dear ${userName},</p>
            <p>We are pleased to help you.</p>
            <h2>Your OTP code <span> ${otp}</span> is valid for ${process.env.TIMEOTPEXPIRE} minutes </h2>
        </div>

        <div class="footer">
            <p>Thank you,<br>${userName} </p>
        </div>
    </div>

</body>
</html>
`;
};
