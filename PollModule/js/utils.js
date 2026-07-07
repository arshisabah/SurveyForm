const generateId = () => {
    return crypto.randomUUID();
};

const validatePoll = (question, options) => {
    if (!question.trim()) {
        return {
            valid: false,
            message: "Poll question is required."
        };
    }

    if (options.length < MIN_OPTIONS) {
        return {
            valid: false,
            message: `Minimum ${MIN_OPTIONS} options are required.`
        };
    }

    const hasEmptyOption = options.some(
        (option) => !option.trim()
    );

    if (hasEmptyOption) {
        return {
            valid: false,
            message: "All poll options must be filled."
        };
    }

    const normalizedOptions = options.map(
        (option) => option.trim().toLowerCase()
    );

    const uniqueOptions = new Set(normalizedOptions);

    if (uniqueOptions.size !== options.length) {
        return {
            valid: false,
            message: "Duplicate options are not allowed."
        };
    }

    return {
        valid: true,
        message: ""
    };
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};