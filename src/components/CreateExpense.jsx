import React, { useState } from 'react';

export const CreateExpense = ({ onCreateExpense, loading }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitters, setSplitters] = useState('');
  const [createdId, setCreatedId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !splitters) {
      alert('Please fill all fields');
      return;
    }
    
    const expenseId = await onCreateExpense(description, amount, splitters);
    if (expenseId) {
      setCreatedId(expenseId);
      // Clear form
      setDescription('');
      setAmount('');
      setSplitters('');
    }
  };

  return (
    <div className="card create-expense-card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-icon">📝</span>
          Create New Expense
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-input"
            placeholder="What's this expense for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amount (ETH)</label>
          <input
            type="number"
            step="0.001"
            className="form-input"
            placeholder="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Split With (Addresses)</label>
          <textarea
            className="form-input textarea"
            placeholder="0x123..., 0x456..., 0x789..."
            value={splitters}
            onChange={(e) => setSplitters(e.target.value)}
            disabled={loading}
            rows="3"
          />
          <small className="form-hint">Comma-separated wallet addresses</small>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <span className="loading">Creating...</span>
          ) : (
            <>
              <span className="btn-icon">✨</span>
              Create & Pay My Share
            </>
          )}
        </button>
      </form>

      {createdId && (
        <div className="success-message">
          <span className="success-icon">🎉</span>
          Expense ID: <strong>{createdId}</strong>
        </div>
      )}
    </div>
  );
};