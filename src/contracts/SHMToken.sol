// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SHMToken {
    string public name = "Shardeum Mock Token";
    string public symbol = "SHM";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**decimals;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Trading records
    struct Trade {
        address trader;
        string asset; // "BTC" or "ETH"
        string tradeType; // "BUY" or "SELL"
        uint256 amount;
        uint256 price;
        uint256 totalSHM;
        uint256 timestamp;
    }
    
    Trade[] public trades;
    mapping(address => uint256[]) public userTrades;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TradeExecuted(
        address indexed trader,
        string asset,
        string tradeType,
        uint256 amount,
        uint256 price,
        uint256 totalSHM
    );
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // Mint tokens for demo purposes (in production, this should be restricted)
    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    // Execute a trade and log it on-chain
    function executeTrade(
        string memory asset,
        string memory tradeType,
        uint256 amount,
        uint256 price,
        uint256 totalSHM
    ) public {
        require(balanceOf[msg.sender] >= totalSHM, "Insufficient SHM balance");
        
        // Create trade record
        Trade memory newTrade = Trade({
            trader: msg.sender,
            asset: asset,
            tradeType: tradeType,
            amount: amount,
            price: price,
            totalSHM: totalSHM,
            timestamp: block.timestamp
        });
        
        trades.push(newTrade);
        userTrades[msg.sender].push(trades.length - 1);
        
        // Transfer SHM tokens (simulate trade execution)
        if (keccak256(abi.encodePacked(tradeType)) == keccak256(abi.encodePacked("BUY"))) {
            // For buy orders, transfer SHM from user
            balanceOf[msg.sender] -= totalSHM;
            balanceOf[address(this)] += totalSHM;
        } else {
            // For sell orders, transfer SHM to user
            balanceOf[address(this)] -= totalSHM;
            balanceOf[msg.sender] += totalSHM;
        }
        
        emit TradeExecuted(msg.sender, asset, tradeType, amount, price, totalSHM);
    }
    
    // Get total number of trades
    function getTotalTrades() public view returns (uint256) {
        return trades.length;
    }
    
    // Get user's trade count
    function getUserTradeCount(address user) public view returns (uint256) {
        return userTrades[user].length;
    }
    
    // Get user's trade by index
    function getUserTrade(address user, uint256 index) public view returns (Trade memory) {
        require(index < userTrades[user].length, "Trade index out of bounds");
        return trades[userTrades[user][index]];
    }
}