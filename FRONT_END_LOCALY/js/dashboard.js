// const baseURL = 'http://localhost:3000'
const baseURL = 'http://jobsearchbasemmouner.eu-4.evennode.com'
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("idToken");
console.log({token});


if (token) {
    localStorage.setItem("userToken", token);
    getTokensWithLogin(token);
  }

  async function getTokensWithLogin(idToken) {

    axios({
        method: 'post',
        url: `${baseURL}/auth/loginWithGmail`,
        data: { idToken },  // ✅ Wrap `idToken` in an object
        headers: { 'Content-Type': 'application/json' }  // ✅ Ensure JSON format

    }).then(function (apiResponse) {
        console.log({apiResponse});
  
      // Handle successful response
      if (apiResponse.data.successMessage === "done login") {
        localStorage.setItem("userToken", apiResponse.data.accessToken);
        // setUserLogin(apiResponse.data.accessToken);
  
        window.location.href = 'chat.html'; // chat page
      }
    }).catch(function (error) {
        console.error("Error during login:", error.response ? error.response.data : error);
    });


  }

 
