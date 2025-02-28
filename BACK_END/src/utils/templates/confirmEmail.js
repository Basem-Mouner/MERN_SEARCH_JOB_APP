

export const confirmEmailTemplateDesign = (emailLink, userName = "new user") => {
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
            background-color:rgb(75, 186, 184);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }
            h1:{
            color:rgb(226, 35, 115)
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
            color: rgb(29, 66, 63);
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin: 20px 0;
            background-color:rgb(19, 52, 128);
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>Confirmation of Email</h1>
        </div>

        <div class="content">
            <p>Dear ${userName},</p>
            <p>We are pleased to confirm your email .</p>
            <p>If you have any questions or need to reschedule, feel free to contact us.</p>
            <a href=${emailLink} class="button">click here to confirm </a>
        </div>

        <div class="footer">
            <p>Thank you,<br>${userName} </p>
        </div>
    </div>

</body>
</html>
`;
};




