import React, { useState} from "react";
import {useParams} from "react-router-dom";

const ManageDues = () => {
    const sampleUsers = [
        { username: "john.doe@example.com", name: "John Doe" },
        { username: "jane.smith@example.com", name: "Jane Smith" },
        { username: "alice.wonderland@example.com", name: "Alice Wonderland" },
    ];
    const [clubData, setClubData] = useState(null);
    const clubId = useParams()
    const [paidDues, setPaidDues] = useState(
        sampleUsers.reduce((acc, user) => ({ ...acc, [user.username]: false }), {})
    );
    const [searchTerm, setSearchTerm] = useState("");

    const togglePaidDues = (username) => {
        setPaidDues((prev) => ({ ...prev, [username]: !prev[username] }));
    };

    const filteredUsers = sampleUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Manage Member Dues</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <table className="min-w-full table-auto border-collapse border border-gray-200">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Paid Dues</th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.username} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={paidDues[user.username]}
                                onChange={() => togglePaidDues(user.username)}
                            />
                        </td>
                    </tr>
                ))}
                {filteredUsers.length === 0 && (
                    <tr>
                        <td
                            colSpan="3"
                            className="text-center text-gray-500 py-4 border border-gray-300"
                        >
                            No users found
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default ManageDues;
