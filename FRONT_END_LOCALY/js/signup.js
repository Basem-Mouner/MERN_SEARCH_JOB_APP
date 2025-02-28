
const baseURL = 'http://jobsearchbasemmouner.eu-4.evennode.com'


$("#signup").click(() => {
    const userName = $("#userName").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const confirmationPassword = $("#confirmationPassword").val();
    const gender = $("#gender").val();
    const mobileNumber = $("#mobileNumber").val();
    const DOB = $("#DOB").val();

    // Check if passwords match
    if (password !== confirmationPassword) {
        alert("Passwords do not match!");
        return;
    }

    const signupData = {
        userName,
        email,
        password,
        confirmationPassword,
        gender,
        mobileNumber,
        DOB
    };

    console.log({ signupData });

    axios({
        method: 'post',
        url: `${baseURL}/auth/signup`,  // Change endpoint for sign-up
        data: signupData,
        headers: { 
            'Content-Type': 'application/json; charset=UTF-8',
            'accept-language': "en-US"
        },
    }).then(function (response) {
        console.log({ response });
        const { successMessage, data } = response.data;
        console.log({ successMessage, data });

        if (successMessage === "Done create new account successfully ") {
            alert("Sign-up successful! Please check your email for verification.");
            window.location.href = 'confirmEmail.html';  // Redirect to login page
        } else {
            console.log("Sign-up failed");
            alert("Sign-up failed: ");
        }
    }).catch(function (error) {
        if (error.response) {
            console.log("Error Data:", error.response.data);  
            console.log("Error Status:", error.response.status);  
        } else {
            console.error("Request failed:", error.message);
        }
    });

});
