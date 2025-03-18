// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Voting
 * @dev Smart contract for a single voting scenario with multiple options
 */
contract Voting {
    // Define a struct to represent a voting option
    struct Option {
        string name;
        uint256 voteCount;
    }

    // Array to store all options
    Option[] public options;

    // Description of the voting scenario
    string public description;

    // Address of the contract owner
    address public owner;

    // Mapping to keep track of voters
    mapping(address => bool) public voters;

    // Timestamps for voting period
    uint256 public votingStart;
    uint256 public votingEnd;

    // Events for logging
    event VoteCast(address indexed voter, uint256 optionIndex);
    event OptionAdded(string name);

    /**
     * @dev Constructor to initialize the contract
     * @param _description Description of the voting scenario
     * @param _optionNames Array of option names (up to 5)
     * @param _durationInMinutes Duration of voting period in minutes
     */
    constructor(
        string memory _description,
        string[] memory _optionNames,
        uint256 _durationInMinutes
    ) {
        require(
            _optionNames.length >= 2 && _optionNames.length <= 5,
            "Must have between 2 and 5 options"
        );

        // Set the description
        description = _description;

        // Add initial options to the array
        for (uint256 i = 0; i < _optionNames.length; i++) {
            options.push(Option({name: _optionNames[i], voteCount: 0}));
            emit OptionAdded(_optionNames[i]);
        }

        // Set the contract owner
        owner = msg.sender;

        // Set voting period start and end times
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    // Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Modifier to check if voting is active
    modifier votingActive() {
        require(
            block.timestamp >= votingStart && block.timestamp < votingEnd,
            "Voting is not active"
        );
        _;
    }

    /**
     * @dev Function to add a new option (only owner can call and only if voting hasn't started)
     * @param _name Name of the new option
     */
    function addOption(string memory _name) public onlyOwner {
        require(block.timestamp < votingStart, "Voting has already started");
        require(options.length < 5, "Maximum number of options (5) reached");

        options.push(Option({name: _name, voteCount: 0}));

        emit OptionAdded(_name);
    }

    /**
     * @dev Function for voters to cast their vote
     * @param _optionIndex Index of the option to vote for
     */
    function vote(uint256 _optionIndex) public votingActive {
        // Check if the voter hasn't voted before
        require(!voters[msg.sender], "You have already voted");

        // Check if the option index is valid
        require(_optionIndex < options.length, "Invalid option index");

        // Increment the vote count for the chosen option
        options[_optionIndex].voteCount++;

        // Mark the voter as having voted
        voters[msg.sender] = true;

        // Emit event
        emit VoteCast(msg.sender, _optionIndex);
    }

    /**
     * @dev Function to get all options and their vote counts
     * @return Array of options with their vote counts
     */
    function getAllOptions() public view returns (Option[] memory) {
        return options;
    }

    /**
     * @dev Function to get the number of options
     * @return Number of options
     */
    function getOptionCount() public view returns (uint256) {
        return options.length;
    }

    /**
     * @dev Function to check if voting is currently active
     * @return Boolean indicating whether voting is active
     */
    function isVotingActive() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }

    /**
     * @dev Function to get the remaining time for voting
     * @return Remaining time in seconds
     */
    function getRemainingTime() public view returns (uint256) {
        // Check if voting has started
        require(block.timestamp >= votingStart, "Voting has not started yet");

        // If voting has ended, return 0
        if (block.timestamp >= votingEnd) {
            return 0;
        }

        // Otherwise, return the remaining time
        return votingEnd - block.timestamp;
    }

    /**
     * @dev Function to check if a user has voted
     * @param _voter Address of the voter to check
     * @return Boolean indicating whether the user has voted
     */
    function hasVoted(address _voter) public view returns (bool) {
        return voters[_voter];
    }

    /**
     * @dev Function to get the winning option
     * @return winningIndex Index of the winning option
     * @return winningName Name of the winning option
     * @return winningVotes Number of votes for the winning option
     */
    function getWinner()
        public
        view
        returns (
            uint256 winningIndex,
            string memory winningName,
            uint256 winningVotes
        )
    {
        require(options.length > 0, "No options available");

        uint256 winningVoteCount = 0;
        uint256 winnerIndex = 0;

        for (uint256 i = 0; i < options.length; i++) {
            if (options[i].voteCount > winningVoteCount) {
                winningVoteCount = options[i].voteCount;
                winnerIndex = i;
            }
        }

        return (
            winnerIndex,
            options[winnerIndex].name,
            options[winnerIndex].voteCount
        );
    }
}
