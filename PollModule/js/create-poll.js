const pollForm =
    document.getElementById("pollForm");

const optionsContainer =
    document.getElementById("optionsContainer");

const addOptionBtn =
    document.getElementById("addOptionBtn");

const messageElement =
    document.getElementById("message");


const createOptionField = (value = "") => {
    const optionRow =
        document.createElement("div");

    optionRow.className = "option-row";

    optionRow.innerHTML = `
        <input
            type="text"
            class="poll-option"
            placeholder="Enter option"
            value="${value}"
        >

        <button
            type="button"
            class="remove-option"
        >
            ✕
        </button>
    `;

    optionsContainer.appendChild(optionRow);
};


const showMessage = (message, type) => {
    messageElement.textContent = message;

    messageElement.className =
        `message ${type}`;
};


addOptionBtn.addEventListener("click", () => {
    createOptionField();
});


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

        if (optionRows.length <= MIN_OPTIONS) {
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


pollForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const question =
            document
                .getElementById("pollQuestion")
                .value
                .trim();

        const choiceType =
            document.querySelector(
                'input[name="choiceType"]:checked'
            ).value;

        const status =
            document
                .getElementById("pollStatus")
                .value;

        const optionInputs = [
            ...document.querySelectorAll(
                ".poll-option"
            )
        ];

        const options = optionInputs.map(
            (input) => input.value.trim()
        );

        const validation =
            validatePoll(question, options);

        if (!validation.valid) {
            showMessage(
                validation.message,
                "error"
            );

            return;
        }

        const newPoll = {
            id: generateId(),

            question,

            choiceType,

            status,

            options: options.map((text) => ({
                id: generateId(),
                text,
                votes: 0
            })),

            totalVotes: 0,

            createdAt:
                new Date().toISOString(),

            updatedAt: null
        };

        addPoll(newPoll);

        showMessage(
            "Poll created successfully!",
            "success"
        );

        setTimeout(() => {
            window.location.href =
                "index.html";
        }, 1000);
    }
);


// Create two options initially

createOptionField();
createOptionField();