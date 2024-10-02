import { useLocation } from 'react-router-dom';


const VerifyAccount = () => {

  const location = useLocation();
  const accountData = location.state.data;


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-5">
      <div className="max-w-lg">
      <h1 className="text-6xl font-bold text-blue-500">Success!</h1>

        <p className="text-2xl text-gray-700 mt-4">
          An email has been sent to {accountData.username}. Click on the link to verify your email.
        </p>
        
        <img 
          className="w-full h-64 object-contain my-6" 
          src="../../public/not_found.jpg" 
        />

      </div>
    </div>
  );
}

export default VerifyAccount;