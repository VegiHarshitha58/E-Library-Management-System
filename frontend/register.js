document.getElementById("registerForm")
.addEventListener("submit", async function(e){

e.preventDefault();

const name =
document.getElementById("name").value.trim();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value;

const confirmPassword =
document.getElementById("confirmPassword").value;

const message =
document.getElementById("message");

message.innerText = "";

const emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailPattern.test(email)){

    message.style.color = "orange";

    message.innerText =
    "Enter a valid email address";

    return;
}

if(password !== confirmPassword){

    message.style.color = "orange";

    message.innerText =
    "Passwords do not match";

    return;
}

const passwordPattern =
/^(?=.*[A-Z])(?=.*\d).{8,}$/;

if(!passwordPattern.test(password)){

    message.style.color = "orange";

    message.innerText =
    "Password needs 8 characters, 1 uppercase and 1 number";

    return;
}

try{

    const response = await fetch(
        "http://localhost:5000/register",
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                name,
                email,
                password
            })
        }
    );

    const data =
    await response.text();

    if(data === "Registration Successful"){

        message.style.color =
        "lightgreen";

        message.innerText =
        "✓ Account Created Successfully";

        document.getElementById(
        "registerForm").reset();

    }else{

        message.style.color =
        "orange";

        message.innerText =
        data;
    }

}
catch(error){

    message.style.color =
    "red";

    message.innerText =
    "Server connection failed";

    console.log(error);
}


});

function togglePassword(id, icon){

const input =
document.getElementById(id);

if(input.type === "password"){

    input.type = "text";

    icon.classList.remove(
    "fa-eye-slash");

    icon.classList.add(
    "fa-eye");

}
else{

    input.type = "password";

    icon.classList.remove(
    "fa-eye");

    icon.classList.add(
    "fa-eye-slash");
}

}
