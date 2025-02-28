
const baseURL = "http://jobsearchbasemmouner.eu-4.evennode.com";

// Confirm OTP
$("#confirmOtp").click(() => {
  const email = $("#email").val();
  const codeOtp = $("#otpCode").val();

  if (!email || !otpCode) {
    alert("Please enter both email and OTP!");
    return;
  }

axios({
        method: 'patch',
        url: `${baseURL}/auth/confirmEmail`,  // Change endpoint for sign-up
        data:  { email, codeOtp },
        headers: { 
            'Content-Type': 'application/json; charset=UTF-8',
            'accept-language': "en-US"
        },
    })
    .then((response) => {
      console.log("OTP Verified:", response.data);
      alert("Email verified successfully!");
      window.location.href = "index.html"; // Redirect to login after success
    })
    .catch((error) => {
      console.error("OTP Error:", error.response?.data || error.message);
      alert("Invalid OTP! Try again.");
    });
});

// Resend OTP
$("#resendOtp").click(() => {
  const email = $("#email").val();

  if (!email) {
    alert("Please enter your email first!");
    return;
  }

    axios({
        method: 'patch',
        url: `${baseURL}/auth/resendOtp`,  
        data:  { email },
        headers: { 
            'Content-Type': 'application/json; charset=UTF-8',
            'accept-language': "en-US"
        },
    })
    .then((response) => {
      console.log("OTP Resent:", response.data);
      alert("OTP resent to your email!");
    })
    .catch((error) => {
      console.error(
        "Resend OTP Error:",
        error.response?.data || error.message
      );
      alert("Failed to resend OTP! Try again.");
    });
});
