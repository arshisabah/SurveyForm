// Clear fields when role changes

const roleButtons = document.querySelectorAll('input[name="role"]');

roleButtons.forEach((role) => {

    role.addEventListener("change", () => {

        // Clear input fields
        username.value = "";
        password.value = "";

        // Clear error messages
        userError.textContent = "";
        passError.textContent = "";
        loginError.textContent = "";

        // Put cursor back in username field
        username.focus();

    });

});