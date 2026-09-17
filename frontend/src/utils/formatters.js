export const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
};

export const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":").map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return "-";
    }

    const period = hours >= 12 ? "PM" : "AM";

    const displayHours =
        hours % 12 || 12;

    return `${String(displayHours).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")} ${period}`;
};