

const baseURL = 'http://jobsearchbasemmouner.eu-4.evennode.com'
// const baseURL = 'http://localhost:3000'

$("#login").click(() => {
    const email = $("#email").val();
    const password = $("#password").val();
    
    const loginData = {
        email,
        password
      };
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
    console.log({ loginData });
    axios({
        method: 'post',
        url: `${baseURL}/auth/login`,
        data: loginData,
        headers: { 'Content-Type': 'application/json; charset=UTF-8',
            'accept-language': "en-US",
        },
    }).then(function (response) {
        console.log({ response });
        const { successMessage, data } = response.data
        console.log({ successMessage, data });
        if (successMessage == "done login") {
            localStorage.setItem('token', data.accessToken);
            window.location.href = 'chat.html'; // chat page
        } else {
            console.log("In-valid email or password");
            alert("In-valid email or password")
        }
    }).catch(function (error) {
        if (error.response) {
            console.log("Error Data:", error.response.data);  // Server's error message
            console.log("Error Status:", error.response.status);  // HTTP Status Code
          } else {
            console.error("Request failed:", error.message);
          }
    });

})

async function socialLogin() {

  try {
    window.location.href =`${baseURL}/auth/google`;
  } catch (error) {
    console.error("Error during social login:", error);
  }

 
}






