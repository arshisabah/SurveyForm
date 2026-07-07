// =====================================
// GET HTML ELEMENTS
// =====================================

const editPollForm =
    document.getElementById("editPollForm");

const pollQuestion =
    document.getElementById("pollQuestion");

const pollStatus =
    document.getElementById("pollStatus");

const optionsContainer =
    document.getElementById("optionsContainer");

const addOptionBtn =
    document.getElementById("addOptionBtn");

const messageElement =
    document.getElementById("message");


// =====================================
// GET POLL ID FROM URL
// =====================================

// Example URL:
// edit-poll.html?id=123

const urlParams =
    new URLSearchParams(window.location.search);

const pollId =
    urlParams.get("id");


// =====================================
// GET POLL FROM LOCAL STORAGE
// =====================================

const existingPoll =
    getPollById(pollId);


// =====================================
// SHOW MESSAGE FUNCTION
// =====================================

const showMessage = (message, type) => {

    messageElement.textContent = message;

    messageElement.className =
        `message ${type}`;
};


// =====================================
// CREATE OPTION INPUT FIELD
// =====================================

const createOptionField = (
    value = "",
    optionId = null
) => {

    const optionRow =
        document.createElement("div");

    optionRow.className = "option-row";

    optionRow.dataset.optionId =
        optionId || generateId();


    optionRow.innerHTML = `
        <input
            type="text"
            class="poll-option"
            placeholder="Enter option"
        >

        <button
            type="button"
            class="remove-option"
        >
            ✕
        </button>
    `;


    const optionInput =
        optionRow.querySelector(".poll-option");

    optionInput.value = value;


    optionsContainer.appendChild(optionRow);
};


// =====================================
// LOAD EXISTING POLL DATA
// =====================================

const loadPollData = () => {

    if (!existingPoll) {

        showMessage(
            "Poll not found.",
            "error"
        );

        editPollForm.style.display = "none";

        return;
    }


    // Set Question

    pollQuestion.value =
        existingPoll.question;


    // Set Choice Type

    const selectedChoiceType =
        document.querySelector(
            `input[name="choiceType"]
            [value="${existingPoll.choiceType}"]`
        );


    if (selectedChoiceType) {

        selectedChoiceType.checked = true;

    }


    // Set Status

    pollStatus.value =
        existingPoll.status;


    // Clear Option Container

    optionsContainer.innerHTML = "";


    // Load Existing Options

    existingPoll.options.forEach(
        (option) => {

            createOptionField(
                option.text,
                option.id
            );

        }
    );
};


// =====================================
// ADD NEW OPTION
// =====================================

addOptionBtn.addEventListener(
    "click",
    () => {

        createOptionField();

    }
);


// =====================================
// REMOVE OPTION
// =====================================

optionsContainer.addEventListener(
    "click",
    (event) => {

        if (
            !event.target.classList.contains(
                "remove-option"
            )
        ) {
            return;
        }


        const optionRows =
            document.querySelectorAll(
                ".option-row"
            );


        if (
            optionRows.length <= MIN_OPTIONS
        ) {

            showMessage(
                `Minimum ${MIN_OPTIONS} options are required.`,
                "error"
            );

            return;
        }


        event.target
            .closest(".option-row")
            .remove();

    }
);


// =====================================
// UPDATE POLL
// =====================================

editPollForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        // Get Updated Question

        const question =
            pollQuestion.value.trim();


        // Get Updated Choice Type

        const choiceType =
            document.querySelector(
                'input[name="choiceType"]:checked'
            ).value;


        // Get Updated Status

        const status =
            pollStatus.value;


        // Get All Option Rows

        const optionRows = [
            ...document.querySelectorAll(
                ".option-row"
            )
        ];


        // Get Option Text

        const optionTexts =
            optionRows.map(
                (row) =>
                    row
                        .querySelector(
                            ".poll-option"
                        )
                        .value
                        .trim()
            );


        // Validate Poll

        const validation =
            validatePoll(
                question,
                optionTexts
            );


        if (!validation.valid) {

            showMessage(
                validation.message,
                "error"
            );

            return;
        }


        // Create Updated Options

        const updatedOptions =
            optionRows.map((row) => {

                const optionText =
                    row
                        .querySelector(
                            ".poll-option"
                        )
                        .value
                        .trim();


                const oldOption =
                    existingPoll.options.find(
                        (option) =>
                            option.id ===
                            row.dataset.optionId
                    );


                return {

                    id:
                        row.dataset.optionId,

                    text:
                        optionText,

                    votes:
                        oldOption
                            ? oldOption.votes
                            : 0
                };

            });


        // Create Updated Poll Object

        const updatedPoll = {

            ...existingPoll,

            question,

            choiceType,

            status,

            options:
                updatedOptions,

            updatedAt:
                new Date().toISOString()

        };


        // Save Updated Poll

        updatePoll(updatedPoll);


        // Show Success Message

        showMessage(
            "Poll updated successfully!",
            "success"
        );


        // Redirect to Poll List

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1000);

    }
);


// =====================================
// LOAD DATA WHEN PAGE OPENS
// =====================================

loadPollData();