const getPolls = () => {
    try {
        const storedPolls = localStorage.getItem(
            STORAGE_KEYS.POLLS
        );

        return storedPolls
            ? JSON.parse(storedPolls)
            : [];
    } catch (error) {
        console.error("Error reading polls:", error);
        return [];
    }
};

const savePolls = (polls) => {
    localStorage.setItem(
        STORAGE_KEYS.POLLS,
        JSON.stringify(polls)
    );
};

const addPoll = (poll) => {
    const polls = getPolls();

    polls.push(poll);

    savePolls(polls);
};

const getPollById = (pollId) => {
    return getPolls().find(
        (poll) => poll.id === pollId
    );
};

const updatePoll = (updatedPoll) => {
    const polls = getPolls();

    const updatedPolls = polls.map((poll) =>
        poll.id === updatedPoll.id
            ? updatedPoll
            : poll
    );

    savePolls(updatedPolls);
};

const deletePollById = (pollId) => {
    const polls = getPolls();

    const remainingPolls = polls.filter(
        (poll) => poll.id !== pollId
    );

    savePolls(remainingPolls);
};

const togglePollStatus = (pollId) => {
    const polls = getPolls();

    const updatedPolls = polls.map((poll) => {
        if (poll.id === pollId) {
            return {
                ...poll,
                status:
                    poll.status === POLL_STATUS.ACTIVE
                        ? POLL_STATUS.INACTIVE
                        : POLL_STATUS.ACTIVE,
                updatedAt: new Date().toISOString()
            };
        }

        return poll;
    });

    savePolls(updatedPolls);
};