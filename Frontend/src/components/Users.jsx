import { useEffect, useState } from "react";
import Button from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(0);

    useEffect(() => {
        // Clear previous timeout if it exists
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Don't search if filter is empty
        if (filter.trim() === "") {
            setUsers([]);
            return;
        }

        // Set new timeout for debouncing
        const newTimeout = setTimeout(() => {
            fetchUsers();
        }, 300); // 300ms debounce delay

        setTypingTimeout(newTimeout);

        // Cleanup function
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [filter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3000/api/v1/user/bulk?filter=${encodeURIComponent(filter)}`
            );
            setUsers(response.data?.users || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="font-bold mt-6 text-lg">Users</div>
            <div className="my-2">
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-2 py-1 border rounded border-slate-200"
                    value={filter}
                />
                {loading && (
                    <div className="text-sm text-gray-500 mt-1">Searching...</div>
                )}
            </div>
            <div>
                {error ? (
                    <div className="p-4 text-red-500">Error: {error}</div>
                ) : users.length > 0 ? (
                    users.map((user) => <User key={user._id} user={user} />)
                ) : (
                    <div className="p-4 text-gray-500">
                        {filter ? "No users found" : "Type to search users"}
                    </div>
                )}
            </div>
        </>
    );
};

function User({ user }) {
    const navigate = useNavigate();

    return (
        <div className="flex justify-between py-2">
            <div className="flex">
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                    <div className="flex flex-col justify-center h-full text-xl">
                        {user.firstName[0]}
                    </div>
                </div>
                <div className="flex flex-col justify-center h-ful">
                    <div>
                        {user.firstName} {user.lastName}
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-center h-ful">
                <Button
                    onClick={() => navigate(`/send?id=${user._id}&name=${encodeURIComponent(user.firstName)}`)}
                    label={"Send Money"}
                />
            </div>
        </div>
    );
}

User.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
    }).isRequired,
};

export default Users;