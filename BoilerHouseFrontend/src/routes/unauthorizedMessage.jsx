
const UnauthorizedMessage = () => {
    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-red-600 text-white text-2xl p-10 rounded-lg text-center">
                You are not authorized to view this page.
                Make sure you are logged in and have the right permissions.
            </div>
        </div>
    );
};


export default UnauthorizedMessage;