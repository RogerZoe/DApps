import React, { useState } from 'react';

export const PayShare = ({ onCheckExpense, onPayShare, loading }) => {
  const [expenseId, setExpenseId] = useState('');
  const [expenseDetails, setExpenseDetails] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (!expenseId) return;
    
    setChecking(true);
    const details = await onCheckExpense(expenseId);
    setExpenseDetails(details);
    setChecking(false);
  };

  const handlePay = async () => {
    if (!expenseId) return;
    await onPayShare(expenseId);
    // Refresh details after payment
    handleCheck();
  };

  return (
    <div className="card pay-share-card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-icon">💳</span>
          Pay Your Share
        </h2>
      </div>

      <div className="pay-form">
        <div className="form-group">
          <label className="form-label">Expense ID</label>
          <div className="input-group">
            <input
              type="number"
              className="form-input"
              placeholder="Enter expense ID"
              value={expenseId}
              onChange={(e) => setExpenseId(e.target.value)}
              disabled={loading || checking}
            />
            <button 
              className="check-btn"
              onClick={handleCheck}
              disabled={loading || checking || !expenseId}
            >
              {checking ? 'Checking...' : 'Check Details'}
            </button>
          </div>
        </div>

        {expenseDetails && (
          <div className="expense-details">
            <h3 className="details-title">Expense Details</h3>
            
            <div className="detail-item">
              <span className="detail-label">📋 Description:</span>
              <span className="detail-value">{expenseDetails.description}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">💰 Total Amount:</span>
              <span className="detail-value highlight">{expenseDetails.amount} ETH</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">🪙 Your Share:</span>
              <span className="detail-value highlight">{expenseDetails.shareAmount} ETH</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">📊 Status:</span>
              <span className={`status-badge ${expenseDetails.hasPaid ? 'paid' : 'pending'}`}>
                {expenseDetails.hasPaid ? '✅ Paid' : '⏳ Pending'}
              </span>
            </div>

            {!expenseDetails.hasPaid && (
              <button 
                className="pay-btn"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay My Share'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};