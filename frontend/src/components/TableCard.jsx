
const TableCard = ({ table, onSelect }) => {
    return (
        <div className="rounded-xl border p-5 shadow-sm">
            <h3 className="text-xl font-semibold">
                Table {table.tableNumber}
            </h3>

            <p className="mt-2">
                Seats: {table.capacity}
            </p>

            <p>
                Location: {table.location}
            </p>

            <button
                onClick={() => onSelect(table)}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
            >
                Select Table
            </button>
        </div>
    );
};

export default TableCard;