// Restore saved values
window.addEventListener("load", () => {

    document.getElementById("name").value =
        localStorage.getItem("regName") || "";

    document.getElementById("email").value =
        localStorage.getItem("regEmail") || "";

});

// Save while typing
document.getElementById("name")
.addEventListener("input", function() {

    localStorage.setItem(
        "regName",
        this.value
    );

});

document.getElementById("email")
.addEventListener("input", function() {

    localStorage.setItem(
        "regEmail",
        this.value
    );

});

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

    const terms =
    document.getElementById("terms").checked;

    const message =
    document.getElementById("message");

    const registerBtn =
    document.getElementById("registerBtn");

    message.innerText = "";

    message.style.background =
    "transparent";

    /* LOADING BUTTON */

    registerBtn.innerText =
    "Creating Account...";

    registerBtn.disabled =
    true;

    /* NAME VALIDATION */

    if(name.length < 3){

        message.style.color =
        "#f59e0b";

        message.style.background =
        "rgba(245,158,11,0.15)";

        message.innerText =
        "Name should contain at least 3 characters";

        registerBtn.innerText =
        "Create Account";

        registerBtn.disabled =
        false;

        return;
    }

    /* EMAIL VALIDATION */

    const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(email)){

        message.style.color =
        "#f59e0b";

        message.style.background =
        "rgba(245,158,11,0.15)";

        message.innerText =
        "Enter a valid email address";

        registerBtn.innerText =
        "Create Account";

        registerBtn.disabled =
        false;

        return;
    }

    /* DOMAIN VALIDATION */

const allowedDomains =
   "@steelplant.in";

    if(!email.toLowerCase().endsWith(allowedDomain)){

        message.style.color =
        "#f59e0b";

        message.style.background =
        "rgba(245,158,11,0.15)";

        message.innerText =
        "Please use an approved organization email address";

        registerBtn.innerText =
        "Create Account";

        registerBtn.disabled =
        false;

        return;
    }

    /* PASSWORD MATCH */

    if(password !== confirmPassword){

        message.style.color =
        "#f59e0b";

        message.style.background =
        "rgba(245,158,11,0.15)";

        message.innerText =
        "Passwords do not match";

        registerBtn.innerText =
        "Create Account";

        registerBtn.disabled =
        false;

        return;
    }

    /* PASSWORD STRENGTH */

    const passwordPattern =
    /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if(!passwordPattern.test(password)){

        message.style.color =
        "#f59e0b";

        message.style.background =
        "rgba(245,158,11,0.15)";

        message.innerText =
        "Password needs 8 characters, 1 uppercase and 1 number";

        registerBtn.innerText =
        "Create Account";

        registerBtn.disabled =
        false;

        return;
    }

    /* TERMS */

    if(!terms){

        message.style.color =
        "#f59e0b";

        message.style.background =
        "rgba(245,158,11,0.15)";

        message.innerText =
        "Please accept Terms & Conditions";

        registerBtn.innerText =
        "Create Account";

        registerBtn.disabled =
        false;

        return;
    }

    try{

        const response = await fetch(
            "http://localhost:5000/register",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
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
            "#22c55e";

            message.style.background =
            "rgba(34,197,94,0.15)";

            message.innerText =
            "✓ Registration successful! Redirecting to login...";
            if(data === "Registration Successful"){

    localStorage.removeItem("regName");
    localStorage.removeItem("regEmail");
    localStorage.removeItem("regPassword");
    localStorage.removeItem("regConfirmPassword");

    document.getElementById(
    "registerForm").reset();

}

            setTimeout(() => {

                window.location.href =
                "login.html";

            }, 2000);

        }
        else{

            message.style.color =
            "#f59e0b";

            message.style.background =
            "rgba(245,158,11,0.15)";

            message.innerText =
            data;
        }

    }
    catch(error){

        message.style.color =
        "#ef4444";

        message.style.background =
        "rgba(239,68,68,0.15)";

        message.innerText =
        "Server connection failed";

        console.log(error);

    }

    registerBtn.innerText =
    "Create Account";

    registerBtn.disabled =
    false;

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