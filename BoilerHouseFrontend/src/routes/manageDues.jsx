import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ManageDues = () => {

    const [members, setMembers] = useState([]);

    const clubId = useParams().clubId;
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true); // Adding loading state

    const togglePaidDues = (user) => {
        // update backend
        const token = localStorage.getItem("token");
        axios
            .get(`http://127.0.0.1:8000/api/club/update_paid_dues`, {
                headers: {
                    Authorization: token,  // Ensure token is prefixed with 'Bearer' if needed
                },
                params: {
                    club_id: clubId,
                    email:user.email,
                    did_pay:!user.did_pay
                },
            })
            .then((response) => {
                const updatedMembers = members.map((member) =>
                    member.email === user.email
                        ? { ...member, did_pay: !member.did_pay }
                        : member
                );

                setMembers(updatedMembers);
            })
            .catch((error) => {
                alert("Error updating the member's status");
                success = false
            });
    };

    const filteredUsers = members.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        // fetch club data for the club
        const token = localStorage.getItem("token");
        // Fetch club data from the API
        axios
            .get(`http://127.0.0.1:8000/api/club/get_dues_information`, {
                headers: {
                    Authorization: token,  // Ensure token is prefixed with 'Bearer' if needed
                },
                params: {
                    club_id: clubId
                },
            })
            .then((response) => {
                setMembers(response.data.dues_information)
                setIsLoading(false);  // Set loading to false when data is fetched
            })
            .catch((error) => {
                alert("Error fetching club data");
                setIsLoading(false);  // Stop loading if there's an error
            });

    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading
            </div>
        );
    }

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
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Paid Dues</th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.email} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={user.did_pay}
                                onChange={() => togglePaidDues(user)}
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

