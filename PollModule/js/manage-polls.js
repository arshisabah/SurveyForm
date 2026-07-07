const pollList =
    document.getElementById("pollList");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const emptyMessage =
    document.getElementById("emptyMessage");


const renderPolls = (polls) => {
    pollList.innerHTML = "";

    if (polls.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    polls.forEach((poll) => {
        const pollCard =
            document.createElement("article");

        pollCard.className = "poll-card";

        pollCard.innerHTML = `
            <div class="poll-card-header">

                <span class="status ${poll.status}">
                    ${poll.status}
                </span>

                <span class="choice-type">
                    ${poll.choiceType}
                </span>

            </div>

            <h3>${poll.question}</h3>

            <p>
                ${poll.options.length} options
            </p>

            <p>
                Created:
                ${formatDate(poll.createdAt)}
            </p>

            <div class="card-actions">

                <button
                    class="btn toggle-btn"
                    data-id="${poll.id}"
                >
                    ${
                        poll.status ===
                        POLL_STATUS.ACTIVE
                            ? "Disable"
                            : "Enable"
                    }
                </button>

                <a
                    href="edit-poll.html?id=${poll.id}"
                    class="btn"
                >
                    Edit
                </a>

                <button
                    class="btn delete-btn"
                    data-id="${poll.id}"
                >
                    Delete
                </button>

            </div>
        `;

        pollList.appendChild(pollCard);
    });
};


const filterPolls = () => {
    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const filteredPolls =
        getPolls().filter((poll) => {

            const matchesSearch =
                poll.question
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                selectedStatus === "all" ||
                poll.status === selectedStatus;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    renderPolls(filteredPolls);
};


searchInput.addEventListener(
    "input",
    filterPolls
);


statusFilter.addEventListener(
    "change",
    filterPolls
);


pollList.addEventListener(
    "click",
    (event) => {

        const pollId =
            event.target.dataset.id;

        if (
            event.target.classList.contains(
                "delete-btn"
            )
        ) {
            const confirmed =
                confirm(
                    "Are you sure you want to delete this poll?"
                );

            if (confirmed) {
                deletePollById(pollId);
                filterPolls();
            }
        }

        if (
            event.target.classList.contains(
                "toggle-btn"
            )
        ) {
            togglePollStatus(pollId);
            filterPolls();
        }
    }
);


renderPolls(getPolls());