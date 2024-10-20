
const LoadingSpinner = ({ message }) => {
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="flex justify-center items-center animate-spin h-8 w-8 border-b-4 border-t-4 border-red-500 rounded-full"></div>
            {message && <p className="mt-4 text-center">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
