import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SendMoney = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const name = decodeURIComponent(searchParams.get("name") || "User");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [balance, setBalance] = useState(null);
    const navigate = useNavigate();

    // Fetch sender's balance on component mount
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const rawToken = localStorage.getItem("token");
                const cleanToken = rawToken?.replace(/"/g, '') || '';
                
                const response = await axios.get(
                    "http://localhost:3000/api/v1/account/balance",
                    {
                        headers: {
                            Authorization: `Bearer ${cleanToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                
                setBalance(response.data.balance);
            } catch (error) {
                console.error("Balance fetch error:", error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate("/signin");
                }
            }
        };

        fetchBalance();
    }, [navigate]);

    const handleTransfer = async () => {
        setError("");
        
        // Enhanced validation
        if (!amount || isNaN(amount) || amount <= 0) {
            setError("Please enter a valid positive amount");
            return;
        }
    
        const numericAmount = parseFloat(amount);
        if (numericAmount <= 0) {
            setError("Amount must be greater than zero");
            return;
        }

        if (balance !== null && numericAmount > balance) {
            setError("Amount exceeds your current balance");
            return;
        }
    
        setIsLoading(true);
        
        try {
            const rawToken = localStorage.getItem("token");
            const cleanToken = rawToken?.replace(/"/g, '') || '';
            
            const response = await axios.post(
                "http://localhost:3000/api/v1/account/transfer",
                { 
                    to: id, 
                    amount: numericAmount 
                },
                {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                        "Content-Type": "application/json"
                    },
                }
            );
            
            if (response.data.success) {
                alert(`Successfully transferred ₹${numericAmount.toFixed(2)} to ${name}`);
                navigate("/dashboard", { state: { refreshBalance: true } });
            }
        } catch (error) {
            console.error("Transfer error:", error);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error ||
                               "Transfer failed. Please try again.";
            setError(errorMessage);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate("/signin");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center h-screen bg-gray-100">
            <div className="h-full flex flex-col justify-center">
                <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h2 className="text-3xl font-bold text-center">Send Money</h2>
                        {balance !== null && (
                            <p className="text-sm text-gray-500 text-center">
                                Available Balance: ₹{balance.toFixed(2)}
                            </p>
                        )}
                    </div>
                    <div className="p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-2xl text-white">
                                    {name[0].toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold">{name}</h3>
                                <p className="text-sm text-gray-500">User ID: {id}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="amount">
                                    Amount (in ₹)
                                </label>
                                <input
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        // Prevent multiple decimal points
                                        if ((value.match(/\./g) || []).length <= 1) {
                                            setAmount(value);
                                        }
                                    }}
                                    value={amount}
                                    type="text"
                                    inputMode="decimal"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    id="amount"
                                    placeholder="Enter amount"
                                />
                            </div>
                            
                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}
                            
                            <button
                                onClick={handleTransfer}
                                disabled={isLoading || !amount}
                                className={`justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full bg-green-500 text-white hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                    isLoading || !amount ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? 'Processing...' : 'Initiate Transfer'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendMoney;