import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import { 
  WalletConnection, 
  CreateExpense, 
  PayShare, 
  StatusMessage,
  Header 
} from './components';
import CONTRACT_ABI from './abi/SplitPaymentABI.json';


const CONTRACT_ADDRESS = '0x79a58A9F6Dc89040f135aeb11B79559790fC899B';
 // Add your deployed contract address

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await web3Instance.eth.getAccounts();
        const contractInstance = new web3Instance.eth.Contract(
          CONTRACT_ABI,
          CONTRACT_ADDRESS
        );

        setWeb3(web3Instance);
        setContract(contractInstance);
        setAccount(accounts[0]);

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0] || '');
        });

      } catch (error) {
        showStatus('Failed to connect wallet', 'error');
      }
    } else {
      showStatus('Please install MetaMask!', 'error');
    }
  };

  const showStatus = (message, type = 'info') => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 5000);
  };

  const createExpense = async (description, amount, splitters) => {
    setLoading(true);
    try {
      const amountWei = web3.utils.toWei(amount.toString(), 'ether');
      const splittersArray = splitters.split(',').map(s => s.trim());
      
      const receipt = await contract.methods
        .createExpense(description, splittersArray)
        .send({ from: account, value: amountWei });
      
      const expenseId = receipt.events.ExpenseCreated.returnValues.id;
      showStatus(`✅ Expense created! ID: ${expenseId}`, 'success');
      return expenseId;
    } catch (error) {
      showStatus(`❌ ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getExpenseDetails = async (expenseId) => {
    try {
      const details = await contract.methods
        .getExpenseDetails(expenseId)
        .call({ from: account });
      
      return {
        description: details.description,
        amount: web3.utils.fromWei(details.amount, 'ether'),
        payer: details.payer,
        shareAmount: web3.utils.fromWei(details.shareAmount, 'ether'),
        hasPaid: details.hasPaid
      };
    } catch (error) {
      showStatus('Failed to fetch expense details', 'error');
      return null;
    }
  };

  const payShare = async (expenseId) => {
    setLoading(true);
    try {
      const details = await contract.methods
        .getExpenseDetails(expenseId)
        .call({ from: account });
      
      await contract.methods
        .payShare(expenseId)
        .send({ from: account, value: details.shareAmount });
      
      showStatus('✅ Payment successful!', 'success');
    } catch (error) {
      showStatus(`❌ ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app ">
      <div className="background-gradient " />
      
      <Header />
      
      <WalletConnection account={account} onConnect={initializeWeb3} />
      
      {account && (
        <div className="main-container">
          <CreateExpense 
            onCreateExpense={createExpense} 
            loading={loading} 
          />
          
          <PayShare 
            onCheckExpense={getExpenseDetails}
            onPayShare={payShare}
            loading={loading}
          />
        </div>
      )}
      
      <StatusMessage status={status} />
    </div>
  );
}

export default App;