// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleSplitPayment {
    
    struct Expense {
        string description;
        uint256 amount;
        address payer;
        address[] splitters;
        mapping(address => bool) hasPaid;
        uint256 paidCount;
    }
    
    uint256 public expenseCounter;
    mapping(uint256 => Expense) public expenses;
    
    event ExpenseCreated(uint256 id, string description, uint256 amount, address payer);
    event ExpenseSettled(uint256 id, address settler, uint256 share);
    event ExpenseCompleted(uint256 id);
    
    // Create expense and split equally
    function createExpense(
        string memory _description,
        address[] memory _splitters
    ) external payable returns (uint256) {
        require(msg.value > 0, "Send ETH for expense");
        require(_splitters.length > 0, "Add splitters");
        
        uint256 expenseId = expenseCounter++;
        Expense storage expense = expenses[expenseId];
        
        expense.description = _description;
        expense.amount = msg.value;
        expense.payer = msg.sender;
        expense.splitters = _splitters;
        emit ExpenseCreated(expenseId, _description, msg.value, msg.sender);
        return expenseId;
    }
    
    // Pay your share of the expense
    function payShare(uint256 _expenseId) external payable {
        Expense storage expense = expenses[_expenseId];
        require(expense.amount > 0, "Expense doesn't exist");
        require(!expense.hasPaid[msg.sender], "Already paid");
        
        // Calculate equal share
        uint256 share = expense.amount / (expense.splitters.length + 1); // +1 for payer
        require(msg.value == share, "Wrong amount");
        
        expense.hasPaid[msg.sender] = true;
        expense.paidCount++;
        
        // Send to original payer
        payable(expense.payer).transfer(msg.value);
        
        emit ExpenseSettled(_expenseId, msg.sender, share);
        
        // Check if all paid
        if (expense.paidCount == expense.splitters.length) {
            emit ExpenseCompleted(_expenseId);
        }
    }
    
    // View functions
    function getExpenseDetails(uint256 _expenseId) external view returns (
        string memory description,
        uint256 amount,
        address payer,
        uint256 shareAmount,
        bool hasPaid
    ) {
        Expense storage expense = expenses[_expenseId];
        uint256 share = expense.amount / (expense.splitters.length + 1);
        
        return (
            expense.description,
            expense.amount,
            expense.payer,
            share,
            expense.hasPaid[msg.sender]
        );
    }
    
    function getSplitters(uint256 _expenseId) external view returns (address[] memory) {
        return expenses[_expenseId].splitters;
    }
}