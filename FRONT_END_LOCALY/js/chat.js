
//images links
let avatar = "./avatar/Avatar-No-Background.png";
let meImage = "./avatar/Avatar-No-Background.png";
let friendImage = "./avatar/Avatar-No-Background.png";
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const applicantsList = document.getElementById("applicants-list");
const chatMessages = document.getElementById("chat-messages");
const chatWith = document.getElementById("chat-with");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
let selectedUser = null; // Track the selected applicant
let selectHr = null;
let globalProfile = {};
let sederId=''
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// const baseURL = "http://localhost:3000";
const baseURL = 'http://jobsearchbasemmouner.eu-4.evennode.com'
const token = `user ${localStorage.getItem("token")}`;
const headers = {
  "Content-Type": "application/json; charset=UTF-8",
  "accept-language": "en-US",
  authorization: token,
    "Accept": "application/json"
};


const clintIo = io(baseURL, {
  auth: { authorization: token },
});
//listen to connection event
clintIo.on("connect", () => {
  console.log("connection stable");
  console.log(clintIo.id);
});


//++++++++++++++++++++ERROR RESPONSE++++++++++++++++++++++
clintIo.on("socketErrorResponse", (data) => {
  console.log(data);
  alert(data.message);
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++

//++++++++++++++++++++++++++++new application+++++++++++
clintIo.on("newApplication", (data) => {
  console.log(data);
  alert(`${data.message}`);
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++


clintIo.on("successMessage", (data) => {
  const { chat, message } = data;
  console.log({ chat, message });
  
  meImage = chat?.mainUser.profilePic?.secure_url || avatar;
  friendImage = chat?.subParticipant.profilePic?.secure_url || avatar;
  const div = document.createElement("div");
  div.className = "me text-end p-2";
  div.dir = "rtl";
  div.innerHTML = `
    <img class="chatImage" src="${meImage}" alt="" srcset="">
    <span class="mx-2">${message}</span>
    `;
});
clintIo.on("receiveMessage", (data) => {
  console.log({ RM: data });
  const { message } = data;
   sederId=data.userId
   $("#chatHr").on("click", () => startChatToHr(sederId)); // USER CANT CHAT WITH HR without hr begin sta

   const messageDiv = document.createElement("div");
   messageDiv.dir = "ltr";
   messageDiv.innerHTML = `
    <img class="chatImage" src="${globalProfile.profilePic?.secure_url || avatar}" alt="" srcset="">
    <span class="mx-2">${message}</span>
    `;
  chatMessages.appendChild(messageDiv);

});
//collect messageInfo
function sendMessage(destId,message,jobId) {
  console.log({ destId,message,jobId });
  const data = {
    message,
    destId,
    jobId
  };
  clintIo.emit("sendMessage", data);
}
// -1-Display Users
function getUserData() {
  axios({
    method: "get",
    url: `${baseURL}/users/profile`,
    headers,
  })
    .then(function (response) {
      //================================
      console.log({ D: response.data });
      ///===============================

      const { user } = response.data?.data;
      globalProfile = user;

      document.getElementById("accountNAME").innerHTML = `${user.userName} ....... role Degree ${user.role}`;
      if (user.role=="hr") {
        $("#chatHr").hide();
        $("#send-button").hide();
      }else if(user.role=="user"){
        $("#chatHr").show();
        $("#send-button").hide();
        $(".chat-header").hide();
      }else if(user.role=="admin"){
        $("#chatHr").show();
        $(".chat-header").show();
        $("#send-button").show();
      }

    })
    .catch(function (error) {
      console.log(error);
    });

}
//-2-
function getCompanyData() {
  axios({
    method: "get",
    url: `${baseURL}/company`,
    headers,
  })
    .then(function (response) {
      //================================
      console.log({ D: response.data });
      ///===============================
      const  companies  =  response.data;
    
      const AllCompany=companies.data.companies;
      console.log(AllCompany);

      let cartonna = ``;
      for (let i = 0; i < AllCompany.length; i++) {
        cartonna += `
            <div onclick="displayJobCompany('${AllCompany[i]._id}')"  class="p-2 mx-1  cursor-pointer bg-warning ">${AllCompany[i].companyName}</div>     
            `;
      }
      document.getElementById("companyNames").innerHTML = cartonna;
    })
    .catch(function (error) {
      console.log(error);
    });
//will get all application with accept status and 
}
getUserData();
getCompanyData();
//-3-
function displayJobCompany(companyId) {
  axios({
    method: "get",
    url: `${baseURL}/company/relatedJob/${companyId}`,
    headers,
  })
    .then(function (response) {
      //================================
      console.log({ D: response.data });
      ///===============================
      const  companies  =  response.data;
    
      const CompanyJobs=companies.data.company.jobs;
      console.log(CompanyJobs);

      let cartonna = ``;
      for (let i = 0; i < CompanyJobs.length; i++) {
        cartonna += `
            
             <div onclick="displayApprovedApplicants('${companyId}','${CompanyJobs[i]._id}')" class="m-1  cursor-pointer  bg-info">${i+1}- ${CompanyJobs[i].jobTitle}</div>     
            `;
      }
      document.getElementById("JOBS").innerHTML = cartonna;
    })
    .catch(function (error) {
      console.log(error);
    });
}
//-4-  //only hr or admin can show this
function displayApprovedApplicants(companyId,jobId) {
  const applicantsList = document.getElementById("applicants-list");
  applicantsList.innerHTML=''
  let applicants=[]
  // console.log({companyId,jobId});

  axios({
    method: "get",
    url: `${baseURL}/company/${companyId}/job/${jobId}/applications`,
    headers,
  })
    .then(function (response) {
      //================================
      console.log({ D: response.data });
      ///===============================
      const  result  =  response.data;
    
      const allApplications=result.data.applicationsPaginated.data;
      console.log(allApplications);
      applicants=allApplications;

      applicants.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user.userDetails.userName;
        li.dataset.id = user.userDetails._id;
        li.addEventListener("click", () => startChat(user));
        applicantsList.appendChild(li);
    });
      
    })
    .catch(function (error) {
      if (error) {
        console.log(error);
      }
    });
}

//-5- ✅ Start chat with selected user
function startChat(user) {
  $("#send-button").show();
  selectedUser = user;
  displayChatUser(user.userDetails._id);
  chatWith.textContent = `Chat with: ${user.userDetails.userName}`;
  chatMessages.innerHTML = ""; // Clear previous messages
}
//-6-Start chat with hr we will extend abb with icon bar notification to select from any hr send message
function startChatToHr(hrId) {
  $("#send-button").show();
  displayChatUser(hrId);
  console.log(hrId);
  
  // chatMessages.innerHTML = ""; // Clear previous messages
  selectHr = hrId;
}

sendButton.addEventListener("click", () => {
  
  if (!selectedUser){
    console.log("iam user");
    const message = messageInput.value.trim();
    const messageDiv = document.createElement("div");
    messageDiv.dir = "rtl";
    messageDiv.innerHTML = `<img class="chatImage" src="${globalProfile.profilePic?.secure_url || avatar}" alt="" srcset="">: ${message}`;
    chatMessages.appendChild(messageDiv);
    sendMessage(selectHr,message);
    messageInput.value = "";

    //  return alert("Select an applicant to chat!");
    }else{

      console.log("iam hr");

  const message = messageInput.value.trim();
  if (message) {
      const messageDiv = document.createElement("div");
      messageDiv.dir = "rtl";
      messageDiv.innerHTML = `<img class="chatImage" src="${globalProfile.profilePic?.secure_url || avatar}" alt="" srcset="">: ${message}`;
      chatMessages.appendChild(messageDiv);
      sendMessage(selectedUser.userId,message,selectedUser.jobId);
      messageInput.value = "";
      // console.log(selectedUser);
  }
    }
});


//get chat conversation between 2 users and pass it to ShowData fun
function displayChatUser(userId) {
  console.log({ userId });
  axios({
    method: "get",
    url: `${baseURL}/chat/${userId}`,
    headers,
  })
    .then(function (response) {
      const { chat } = response.data?.data;
      console.log(chat);
      if (chat) {
        if (chat.mainUser._id.toString() == globalProfile._id.toString()) {
          meImage = chat.mainUser.profilePic?.secure_url || avatar;
          friendImage = chat.subParticipant.profilePic?.secure_url || avatar;
        } else {
          friendImage = chat.mainUser.profilePic?.secure_url || avatar;
          meImage = chat.subParticipant.profilePic?.secure_url || avatar;
        }

        showData(userId, chat);
      } else {
        showData(userId, 0);
      }
    })
    .catch(function (error) {
      console.log(error);
      console.log({ status: error.status });
      if (error.status == 404) {
        showData(userId, 0);
      } else {
        alert("Ops something went wrong");
      }
    });
}
function showData(destId, chat) {
  chatMessages.innerHTML = "";
  if (chat.messages?.length) {
    
    for (const message of chat.messages) {
      if (message.senderId._id.toString() == globalProfile._id.toString()) {
        const div = document.createElement("div");
        div.className = "me text-end p-2";
        div.dir = "rtl";
        div.innerHTML = `
                <img class="chatImage" src="${meImage}" alt="" srcset="">
                <span class="mx-2">${message.message}</span>
                `;
                chatMessages.appendChild(div);
      } else {
        const div = document.createElement("div");
        div.className = "myFriend p-2";
        div.dir = "ltr";
        div.innerHTML = `
                <img class="chatImage" src="${friendImage}" alt="" srcset="">
                <span class="mx-2">${message.message}</span>
                `;
                chatMessages.appendChild(div);
      }
    }
  } else {
    // const div = document.createElement("div");

    // div.className = "noResult text-center  p-2";
    // div.dir = "ltr";
    // div.innerHTML = `
    //     <span class="mx-2">Say Hi to start the conversation.</span>
    //     `;
    // chatMessages.appendChild(div);
  }
}


