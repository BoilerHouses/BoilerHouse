import { Button } from '@mui/material';  // MUI button
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-5">
      <div className="max-w-lg">
        <h1 className="text-6xl font-bold text-blue-500">404</h1>
        <p className="text-2xl text-gray-700 mt-4">
          That page does not exist
        </p>
        <p className="text-gray-600 mt-2">
          You done messed up, and must pay for the consequences
        </p>
        
        <img 
          className="w-full h-64 object-contain my-6" 
          src="../../public/not_found.jpg" 
          alt="funny gif"
        />

        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Take Me Home
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;